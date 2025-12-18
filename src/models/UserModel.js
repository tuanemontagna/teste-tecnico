import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Profile from "./ProfileModel.js";

const User = sequelize.define(
    'users',
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
        },
        email: {
            field: 'email',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            field: 'password',
            type: DataTypes.STRING,
            allowNull: false,
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

User.belongsTo(Profile, {
    as: 'profile',
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    foreignKey: {
        name: 'profileId',
        allowNull: false,
        field: 'profile_id',
    }
});

export default User;