import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Sector from "./SectorModel.js";

const Shelf = sequelize.define(
    'shelves',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        code: {
            field: 'code',
            type: DataTypes.STRING,
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

Shelf.belongsTo(Sector, {
    as: 'sector',
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    foreignKey: {
        name: 'sectorId',
        allowNull: false,
        field: 'sector_id',
    }
});

export default Shelf;