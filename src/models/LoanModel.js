import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import User from "./UserModel.js";
import Book from "./BookModel.js";

const Loan = sequelize.define(
    'loans',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        loanDate: {
            field: 'loan_date',
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dueDate: {
            field: 'due_date',
            type: DataTypes.DATE,
            allowNull: false,
        },
        returnDate: {
            field: 'return_date',
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            field: 'status',
            type: DataTypes.STRING,
            defaultValue: 'OPEN', 
        },
        basePriceSnapshot: {
            field: 'base_price_snapshot',
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Price of rent at the moment of creation'
        },
        totalAmount: {
            field: 'total_amount',
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Final calculated amount (fine + rent)'
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'update_at'
    }
);

Loan.belongsTo(User, {
    as: 'user',
    foreignKey: {
        name: 'userId',
        allowNull: false,
        field: 'user_id',
    }
});

Loan.belongsTo(Book, {
    as: 'book',
    foreignKey: {
        name: 'bookId',
        allowNull: false,
        field: 'book_id',
    }
});

export default Loan;