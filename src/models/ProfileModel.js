import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";

const Profile = sequelize.define(
    'profiles',
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
        description: {
            field: 'description',
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'update_at'
    }
);

export default Profile;