// backend/models/eventRegistration.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * EventRegistration
 * Repräsentiert eine Anmeldung zu einem Event (Einzeln oder Staffel)
 */
const EventRegistration = sequelize.define(
    "event_registration",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        // 🔗 Zugehöriges Event
        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🔗 Zugehörige Person
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🔗 Staffel (optional)
        squadron_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "Referenz auf Staffel (Squadron)",
        },

        // 🔗 Lauftag / RunDate (vormals relay_team)
        relay_team_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "Referenz auf Lauftag (RunDate)",
        },

        // 📱 Teilnehmerdaten
        phone_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },

        license_plate: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },

        participation_type: {
            type: DataTypes.ENUM("einzeln", "staffel"),
            allowNull: false,
            defaultValue: "einzeln",
        },

        catering_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },

        wishes: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        gender: {
            type: DataTypes.ENUM("m", "w", "d"),
            allowNull: true,
        },

        club: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },

        start_number: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },

        liability_accept: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        // 🟡 Status der Anmeldung
        status: {
            type: DataTypes.ENUM("in_auswahl", "bestätigt", "abgelehnt"),
            allowNull: false,
            defaultValue: "in_auswahl",
        },
    },
    {
        tableName: "event_registration",
        freezeTableName: true,
        timestamps: true,
        comment: "Anmeldung eines Teilnehmers zu einem Event oder Staffel",
    }
);

module.exports = EventRegistration;
