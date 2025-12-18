import bcrypt from 'bcryptjs'; 
import User from '../models/UserModel.js';

const PROFILE_ADMIN = 1;
const PROFILE_LEITOR = 2;

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        if (!id) {
            const response = await User.findAll({ 
                attributes: { exclude: ['password'] }, 
                order: [['id', 'desc']] 
            });
            return res.status(200).send({ 
                message: 'data found', 
                data: response 
            });
        }

        const response = await User.findOne({ 
            where: { id },
            attributes: { exclude: ['password'] } 
        });

        if (!response) return res.status(404).send({ 
            message: 'record not found' 
        });

        return res.status(200).send({ 
            message: 'data found', 
            data: response 
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

const create = async (body, forcedProfileId = null) => {
    try {
        const { 
            name, 
            email, 
            password, 
            active, 
            profileId, 
            endereco, 
            telefone 
        } = body;

        const userExists = await User.findOne({ 
            where: { email } 
        });

        if (userExists) {
            throw new Error('Email already registered');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const finalProfileId = forcedProfileId !== null ? forcedProfileId : profileId;

        if (!finalProfileId) {
            throw new Error('Profile ID is required');
        }

        const response = await User.create({ 
            name, 
            email, 
            password: passwordHash, 
            active: active !== undefined ? active : true, 
            profileId: finalProfileId,
            endereco, 
            telefone
        });

        response.password = undefined; 
        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async (body, id) => {
    try {
        const response = await User.findOne({ 
            where: { id } 
        });

        if (!response) throw new Error('record not found');
        
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            body.password = await bcrypt.hash(body.password, salt);
        }

        Object.keys(body).forEach((item) => response[item] = body[item]);
        await response.save();

        response.password = undefined;
        return response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const createAdmin = async (req, res) => {
    try {
        const response = await create(req.body, PROFILE_ADMIN);
        return res.status(201).send({ 
            message: 'Admin created successfully', 
            data: response 
        });
    } catch (error) {
        if (error.message === 'Email already registered') {
            return res.status(400).send({ 
                message: error.message 
            });
        }
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

const createLoanUser = async (req, res) => {
    try {
        const response = await create(req.body, PROFILE_LEITOR);
        return res.status(201).send({ 
            message: 'Loan User created successfully', 
            data: response 
        });
    } catch (error) {
        if (error.message === 'Email already registered') {
            return res.status(400).send({ 
                message: error.message 
            });
        }
        return res.status(500).send({
            message: error.message 
            });
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
        if (error.message === 'Email already registered') {
            return res.status(400).send({ 
                message: error.message 
            });
        }
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

        const response = await User.findOne({ 
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

export default { 
    get, 
    persist, 
    destroy,
    createAdmin,    
    createLoanUser  
};