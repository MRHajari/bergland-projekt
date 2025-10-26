// models/invoice.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Person = require("./person");

const Invoice = sequelize.define(
    "Invoice",
    {
        id_rechnung: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        rechnungs_nr: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        id_person: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "person",
                key: "id", // wichtig!
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },


        datum: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },

        betrag_gesamt: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        ist_bezahlt: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        bezahlt_am: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "rechnung",
        timestamps: false,
    }
);


module.exports = Invoice;
