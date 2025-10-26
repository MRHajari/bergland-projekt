const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
    "Product",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "Product name cannot be empty." },
                len: {
                    args: [2, 200],
                    msg: "Product name must be between 2 and 200 characters long.",
                },
            },
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: { msg: "Price must be a decimal number." },
                min: { args: [0], msg: "Price cannot be negative." },
            },
            get() {
                const raw = this.getDataValue("price");
                return raw === null ? null : Number(raw);
            },
        },

        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        valid_from: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        valid_to: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        vat: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 19,
        },
    },
    {
        tableName: "product",
        timestamps: false,
    }
);

module.exports = Product;
