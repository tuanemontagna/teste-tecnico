import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

const SystemParam = sequelize.define(
    'system_params',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        finePerDay: {
            field: 'fine_per_day',
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        baseRent: {
            field: 'base_rent',
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        rentPerDay: {
            field: 'rent_per_day',
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        standardLoanDays: {
            field: 'standard_loan_days',
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 7,
        },
        firstDelayDiscount: {
            field: 'first_delay_discount',
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'update_at'
    }
);

export default SystemParam;