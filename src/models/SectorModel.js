import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

const Sector = sequelize.define(
    'sectors',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            field: 'name',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        active: {
            field: 'active',
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'update_at'
    }
);

export default Sector;