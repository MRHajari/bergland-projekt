const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Product = sequelize.define(
    "Product",
    {
        id_produkt: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        produkt_name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: { msg: "Produktname darf nicht leer sein." },
                len: {
                    args: [2, 200],
                    msg: "Produktname muss zwischen 2 und 200 Zeichen lang sein.",
                },
            },
        },

        preis: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: { msg: "Preis muss eine Zahl sein." },
                min: { args: [0], msg: "Preis darf nicht negativ sein." },
            },
        },

        beschreibung: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        gueltig_von: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        gueltig_bis: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "produkt", // 🔹 korrekt: deutsche Tabelle
        timestamps: false,
    }
);

module.exports = Product;
