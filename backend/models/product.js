const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
    "product",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        tableName: "product",
        timestamps: false, // optional: falls du keine createdAt/updatedAt willst
    }
);

module.exports = Product;
