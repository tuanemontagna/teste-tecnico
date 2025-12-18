import { Op } from 'sequelize';
import Loan from '../models/LoanModel.js';
import User from '../models/UserModel.js';
import SystemParam from '../models/SystemParamModel.js';
import { sequelize } from '../config/postgres.js';

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        
        const queryOptions = {
            include: ['user', 'book'], 
            order: [['id', 'desc']]
        };

        if (!id) {
            const response = await Loan.findAll(queryOptions);
            return res.status(200).send({ 
                message: 'data found', data: response 
            });
        }
        
        const response = await Loan.findOne({ 
            ...queryOptions, 
            where: { id } 
        });
        
        if (!response) return res.status(404).send({
            message: 'record not found' 
        });
        
        return res.status(200).send({ 
            message: 'data found', data: response 
        });

    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

const create = async (body) => {
    try {
        let { userId, bookId, loanDate, dueDate } = body;

        const params = await SystemParam.findOne();
        if (!params) {
            throw new Error('System parameters not configured');
        }

        const normalizedLoanDate = loanDate ? new Date(loanDate) : new Date();
        const standardDays = parseInt(params.standardLoanDays);
        const calculatedDueDate = new Date(normalizedLoanDate);
        calculatedDueDate.setDate(calculatedDueDate.getDate() + (isNaN(standardDays) ? 7 : standardDays));
        const basePriceSnapshot = parseFloat(params.baseRent);

        const activeLoan = await Loan.findOne({
            where: {
                bookId: bookId,
                status: {
                    [Op.in]: ['OPEN', 'LATE'] 
                }
            }
        });

        if (activeLoan) {
            throw new Error(`Book ID ${bookId} is currently unavailable (already borrowed).`);
        }

        const response = await Loan.create({
            userId,
            bookId,
            loanDate: normalizedLoanDate,
            dueDate: dueDate ? new Date(dueDate) : calculatedDueDate,
            basePriceSnapshot
        });

        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async (body, id) => {
    try {
        const loan = await Loan.findOne({ where: { id } });

        if (!loan) {
            throw new Error('record not found');
        }

        if (body.bookId && body.bookId !== loan.bookId) {
            const activeLoan = await Loan.findOne({
                where: {
                    bookId: body.bookId,
                    status: {
                        [Op.in]: ['OPEN', 'LATE']
                    }
                }
            });

            if (activeLoan) {
                throw new Error(`Cannot update: Book ID ${body.bookId} is currently unavailable.`);
            }
        }

        if (body.status === 'RETURNED' && !body.returnDate) {
            body.returnDate = new Date();
        }

        Object.keys(body).forEach((item) => loan[item] = body[item]);
        await loan.save();
        
        return loan;

    } catch (error) {
        throw new Error(error.message);
    }
}

const persist = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        if (!id) {
            const response = await create(req.body);
            return res.status(201).send({ 
                message: 'created successfully', 
                data: response 
            });
        }
        const response = await update(req.body, id);
        return res.status(201).send({ 
            message: 'updated successfully', 
            data: response 
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message
        });
    }
}

const destroy = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) return res.status(400).send({ 
            message: 'please provide an id' 
        });

        const response = await Loan.findOne({
            where: { id } 
        });

        if (!response) return res.status(404).send({ 
            message: 'record not found'
        });

        await response.destroy();

        return res.status(200).send({ 
            message: 'record deleted', 
            data: response 
        });

    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

const diffInDays = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

const calculateValues = async (loan, params) => {
    const now = new Date();
    const referenceDate = loan.returnDate ? new Date(loan.returnDate) : now;
    const daysKept = Math.max(1, diffInDays(loan.loanDate, referenceDate));
    const basePrice = parseFloat(loan.basePriceSnapshot);
    const dailyRent = parseFloat(params.rentPerDay);
    const totalRent = basePrice + (daysKept * dailyRent);
    let fine = 0;
    let isLate = false;
    let discountApplied = false;

    if (referenceDate > loan.dueDate) {
        isLate = true;
        const daysOverdue = diffInDays(loan.dueDate, referenceDate);
        const finePerDay = parseFloat(params.finePerDay);
        
        fine = daysOverdue * finePerDay;
    }

    const totalToPay = totalRent + fine;

    return {
        daysKept,
        isLate,
        discountApplied,
        rent: totalRent.toFixed(2),
        fine: fine.toFixed(2),
        total: totalToPay.toFixed(2)
    };
};

const getPreview = async (req, res) => {
    try {
        const id = req.params.id;
        const loan = await Loan.findOne({ 
            where: { id } 
        });

        if (!loan) return res.status(404).send({ 
            message: 'Loan not found' 
        });

        const params = await SystemParam.findOne();
        if (!params) return res.status(500).send({ 
            message: 'System config missing' 
        });

        const values = await calculateValues(loan, params);

        return res.status(200).send({
            message: 'Preview calculated successfully',
            data: {
                loanId: loan.id,
                bookId: loan.bookId,
                ...values 
            }
        });

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

const returnBook = async (req, res) => {
    try {
        const id = req.params.id;
        const loan = await Loan.findOne({ 
            where: { id } 
        });

        if (!loan) return res.status(404).send({ 
            message: 'Loan not found' 
        });
        if (loan.status === 'RETURNED') return res.status(400).send({ 
            message: 'Book already returned' 
        });

        const params = await SystemParam.findOne();
        if (!params) return res.status(500).send({
            message: 'System parameters not configured' 
            });

        const now = new Date();
        const daysKept = diffInDays(loan.loanDate, now);
        const basePrice = parseFloat(loan.basePriceSnapshot); 
        const dailyRent = parseFloat(params.rentPerDay);
        
        let totalRent = basePrice + (daysKept * dailyRent);
        let fine = 0;
        let isLate = false;

        if (now > loan.dueDate) {
            isLate = true;
            const daysOverdue = diffInDays(loan.dueDate, now);
            const finePerDay = parseFloat(params.finePerDay);
            
            fine = daysOverdue * finePerDay;
        }

        loan.returnDate = now;
        loan.status = isLate ? 'LATE' : 'RETURNED'; 
        loan.totalAmount = (totalRent + fine).toFixed(2);
        
        await loan.save();

        return res.status(200).send({
            message: 'Book returned successfully',
            data: {
                loanId: loan.id,
                daysKept,
                rentValue: totalRent.toFixed(2),
                fineValue: fine.toFixed(2),
                totalToPay: loan.totalAmount,
                status: loan.status
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ 
            message: error.message
        });
    }
};

const getFine = async (req, res) => {
    try {
        const id = req.params.id;
        const loan = await Loan.findOne({ 
            where: { id } 
        });

        if (!loan) return res.status(404).send({ 
            message: 'Loan not found' 
        });

        const params = await SystemParam.findOne();
        if (!params) return res.status(500).send({ 
            message: 'System config missing' 
        });

        const values = await calculateValues(loan, params);

        return res.status(200).send({
            message: 'Fine calculated',
            data: {
                loanId: loan.id,
                fineValue: values.fine,
                isLate: values.isLate,
                discountApplied: values.discountApplied
            }
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
};

const getRental = async (req, res) => {
    try {
        const id = req.params.id;
        const loan = await Loan.findOne({ 
            where: { id } 
        });

        if (!loan) return res.status(404).send({ 
            message: 'Loan not found' 
        });

        const params = await SystemParam.findOne();
        if (!params) return res.status(500).send({ 
            message: 'System config missing' 
        });

        const values = await calculateValues(loan, params);

        return res.status(200).send({
            message: 'Rental calculated',
            data: {
                loanId: loan.id,
                daysKept: values.daysKept,
                rentValue: values.rent
            }
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
};

const applyFirstTimeDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await Loan.findByPk(id);

        if (!loan) return res.status(404).send({ 
            message: 'Loan not found.' 
        });

        if (!loan.returnDate) {
            return res.status(400).send({ 
                message: 'Book not returned yet.' 
            });
        }

        const returnedLate = new Date(loan.returnDate) > new Date(loan.dueDate);
        if (!returnedLate) {
            return res.status(400).send({ 
                message: 'Loan returned on time. No fine to discount.' 
            });
        }

        const previousDelays = await Loan.count({
            where: {
                userId: loan.userId,
                id: { [Op.ne]: id },
                returnDate: { [Op.gt]: sequelize.col('due_date') }
            }
        });

        const isFirstDelay = previousDelays === 0;
        if (!isFirstDelay) {
            return res.status(400).send({ 
                message: 'Not eligible: user has previous delays.' 
            });
        }

        const params = await SystemParam.findOne();
        if (!params) return res.status(500).send({ 
            message: 'System parameters not configured' 
        });

        const finePerDay = parseFloat(params.finePerDay);
        const daysOverdue = diffInDays(loan.dueDate, loan.returnDate);
        const currentFine = daysOverdue * finePerDay;

        const discountRate = parseFloat(params.firstDelayDiscount);
        const discountValue = currentFine * discountRate;

        const newTotal = parseFloat(loan.totalAmount) - discountValue;
        loan.totalAmount = newTotal.toFixed(2);
        await loan.save();

        return res.status(200).send({
            message: 'First-delay discount applied successfully.',
            data: {
                loanId: loan.id,
                isFirstDelay,
                originalFine: currentFine.toFixed(2),
                discountRate: discountRate,
                discountValue: discountValue.toFixed(2),
                finalAmountToPay: loan.totalAmount
            }
        });

    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
};

const getByUser = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        if (!id) {
            return res.status(400).send({ 
                message: 'please provide an id' 
            });
        }

        const role = req.userRole;
        const requesterId = req.userId?.toString();
        if (role !== 'ADMIN' && requesterId !== id) {
            return res.status(403).send({ 
                message: 'forbidden: cannot access other user history' 
            });
        }

        const response = await Loan.findAll({
            where: { userId: id },
            include: ['user', 'book'],
            order: [['id', 'desc']]
        });

        return res.status(200).send({ 
            message: 'data found', data: response 
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

const getOverdue = async (req, res) => {
    try {
        const now = new Date();

        const response = await Loan.findAll({
            where: {
                dueDate: { [Op.lt]: now },
                status: { [Op.ne]: 'RETURNED' }
            },
            include: ['user', 'book'],
            order: [['dueDate', 'asc']]
        });

        return res.status(200).send({ 
            message: 'data found', data: response 
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

export default {
    get,
    persist,
    destroy,
    getPreview,
    returnBook,
    getFine,
    getRental,
    applyFirstTimeDiscount,
    getByUser,
    getOverdue,
};

