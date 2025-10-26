// models/rel-invoice-product.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RelInvoiceProduct = sequelize.define(
    "RelInvoiceProduct",
    {
        id_rechnung: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "rechnung",
                key: "id_rechnung",
            },
            onDelete: "CASCADE",
        },
        id_produkt: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "produkt",
                key: "id_produkt",
            },
            onDelete: "CASCADE",
        },
    },
    {
        tableName: "rel_invoice_product",
        timestamps: false,
    }
);

module.exports = RelInvoiceProduct;
