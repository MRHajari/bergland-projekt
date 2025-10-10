const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🏁 EventRegistration
 * Repräsentiert eine Anmeldung zu einem Event (Einzeln oder Staffel)
 * Eine Person darf sich pro Event nur einmal anmelden.
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
            comment: "Referenz auf das Event",
        },

        // 🔗 Zugehörige Person
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz auf die Person",
        },

        // 🔗 Zugehörige Staffel (optional)
        squadron_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "Referenz auf Staffel (Squadron)",
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
        comment: "Anmeldung einer Person oder Staffel zu einem Event",
        indexes: [
            {
                unique: true,
                fields: ["person_id", "event_id"],
                name: "unique_person_per_event",
            },
        ],
    }
);

module.exports = EventRegistration;
