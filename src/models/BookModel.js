import { DataTypes } from "sequelize";
import { sequelize } from "../config/postgres.js";
import Genre from "./GenreModel.js";
import Shelf from "./ShelfModel.js";

const Book = sequelize.define(
    'books',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            field: 'title',
            type: DataTypes.STRING,
            allowNull: false,
        },
        isbn: {
            field: 'isbn',
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        available: {
            field: 'available',
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        replacementPrice: {
            field: 'replacement_price',
            type: DataTypes.DECIMAL(10, 2),
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

Book.belongsTo(Genre, {
    as: 'genre',
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    foreignKey: {
        name: 'genreId',
        allowNull: false,
        field: 'genre_id',
    }
});

Book.belongsTo(Shelf, {
    as: 'shelf',
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    foreignKey: {
        name: 'shelfId',
        allowNull: false,
        field: 'shelf_id',
    }
});

export default Book;