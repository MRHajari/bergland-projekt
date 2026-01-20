const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventRegistrationParticipant = sequelize.define(
    "event_registration_participant",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 Zugehörige Registrierung
        registration_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 👤 Person
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🧭 Staffel (optional)
        squadron_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        // 🏃 Teilnahme-Art (neu)
        participation_type: {
            type: DataTypes.ENUM('einzeln', 'staffel'),
            allowNull: false,
            defaultValue: 'einzeln',
            comment: 'Teilnahme als Einzelstarter oder in Staffel',
        },

        // 🍽️ Verpflegung (neu)
        catering_type: {
            type: DataTypes.ENUM('vegan', 'vegetarisch'),
            allowNull: true, // null = keine Verpflegung
            comment: 'Verpflegungsart pro Teilnehmer (null = keine)',
        },

        // 🏷️ Startnummer (neu, automatisch)
        start_number: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Automatisch vergebene Startnummer pro Event',
        },
    },
    {
        tableName: "event_registration_participant",
        timestamps: true,
        comment: "Teilnehmer einer Event-Registrierung (Person pro Event)",
    }
);

module.exports = EventRegistrationParticipant;
