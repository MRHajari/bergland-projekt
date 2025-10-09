// backend/models/eventRegistration.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventRegistration = sequelize.define(
    "event_registration",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        phone_number: DataTypes.STRING,
        license_plate: DataTypes.STRING,
        participation_type: DataTypes.STRING, // "einzeln" | "staffel"
        catering_type: DataTypes.STRING,
        wishes: DataTypes.STRING,
        gender: DataTypes.STRING,
        club: DataTypes.STRING,
        start_number: DataTypes.STRING,
        liability_accept: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },

        status: {
            type: DataTypes.ENUM("bestätigt", "in_auswahl", "abgelehnt"),
            allowNull: true,
        },

        relay_team_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        tableName: "event_registration",
        timestamps: true,
    }
);

module.exports = EventRegistration;
