import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

const Genre = sequelize.define(
    'genres',
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
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'update_at'
    }
);

export default Genre;