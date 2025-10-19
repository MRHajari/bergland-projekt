// backend/models/booking.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🏨 Booking Model
 * Repräsentiert eine Unterkunftsbuchung für ein bestimmtes Event.
 * Der eingeloggte User führt die Buchung durch.
 * Die Zuordnung zu einzelnen Personen erfolgt später manuell durch das Personal.
 */
const Booking = sequelize.define(
    "booking",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔹 Der Benutzer, der die Buchung vorgenommen hat
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🔹 Zugehöriges Event (z. B. Pfälzer Berglauf 2025)
        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🔹 Unterkunft (z. B. Haus am See)
        accommodation_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🔹 Anzahl gebuchter Betten
        single_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        double_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        multi_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "booking",
        freezeTableName: true,
        timestamps: true, // erstellt automatisch createdAt & updatedAt
    }
);

module.exports = Booking;
