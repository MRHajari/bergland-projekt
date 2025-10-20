const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventRegistration = sequelize.define(
    "event_registration",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 Zugehöriges Event
        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 👤 Wer hat diese Registrierung angelegt (statt user_id)
        registered_by_person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 📞 Kopf-Felder der Registrierung
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        license_plate: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        start_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        catering_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        wishes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM("m", "w", "d"),
            allowNull: true,
        },
        club: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("in_auswahl", "bestätigt", "abgelehnt"),
            defaultValue: "in_auswahl",
        },
    },
    {
        tableName: "event_registration",
        timestamps: true,
    }
);

module.exports = EventRegistration;
