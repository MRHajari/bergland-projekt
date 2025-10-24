// backend/models/booking.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🏨 Booking Model
 * Repräsentiert eine Unterkunftsbuchung im Rahmen einer Event-Registrierung.
 * Eine Buchung gehört:
 *  - zu einer EventRegistration (fachlich)
 *  - zu einem Event (zur Admin-Auswertung)
 *  - zu einem User (wer gebucht hat)
 */
const Booking = sequelize.define(
    "booking",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 Verknüpft mit EventRegistration
        event_registration_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zur EventRegistration (onDelete: CASCADE)",
        },

        // 🔗 Direkte Verbindung zum Event (für schnelle Abfragen / Admin)
        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zum Event (automatisch aus EventRegistration gesetzt)",
        },

        // 👤 Wer hat die Buchung erstellt
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zum User (JWT-Authentifizierung)",
        },

        // 🏨 Unterkunft (z. B. Haus am See)
        accommodation_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zur gebuchten Unterkunft",
        },

        // 🛏️ Anzahl gebuchter Betten
        single_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
        },
        double_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
        },
        multi_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
        },
    },
    {
        tableName: "booking",
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = Booking;
