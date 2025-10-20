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
        registration_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        squadron_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    { tableName: "event_registration_participant" }
);

module.exports = EventRegistrationParticipant;
