const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🕒 Runtime
 * Repräsentiert eine gelaufene Zeit einer Person in einem bestimmten EventRegistration-Kontext.
 */
const Runtime = sequelize.define(
    "runtime",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 Zugehörige Anmeldung (EventRegistration)
        event_registration_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz auf event_registration",
        },

        // 🔗 Zugehörige Person
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz auf person",
        },

        // 🔗 Zugehörige Strecke (optional)
        route_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "Referenz auf route",
        },

        // 🕓 Startzeit
        start_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        // 🏁 Zielzeit
        end_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        // ⏱️ Gesamtdauer formatiert (z. B. '00:47:32')
        total_time: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },

        // 🥇 Platzierung
        position: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        // 🏃 Distanz in km
        distance: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
    },
    {
        tableName: "runtime",
        freezeTableName: true,
        timestamps: true,
        comment: "Laufzeit-Informationen einer Person innerhalb einer EventRegistration",
    }
);

module.exports = Runtime;
