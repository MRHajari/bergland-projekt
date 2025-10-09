// backend/models/event.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define(
    "event",
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
        description: {
            type: DataTypes.TEXT,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        // 🟢 NEU: Anmeldeschluss
        registration_deadline: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "Datum, bis wann die Anmeldung möglich ist",
        },
    },
    {
        tableName: "event",
        timestamps: true,
    }
);

module.exports = Event;
