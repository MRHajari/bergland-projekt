// backend/models/relay_team.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Dieses Model repräsentiert jetzt "Lauftag" (RunDate),
 * also ein Datum, an dem eine bestimmte Strecke in einem Event stattfindet.
 */
const RelayTeam = sequelize.define(
    "relay_team",
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

        // 🔗 Zugehörige Strecke
        route_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 📅 Lauftag-Datum
        run_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: "Datum, an dem die Strecke gelaufen wird",
        },

        // 🕒 Startzeit optional
        start_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        // 📍 Start-Ort optional
        start_location: {
            type: DataTypes.STRING(180),
            allowNull: true,
        },

        // 📝 Notizen oder Beschreibung
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "relay_team", // Name bleibt für Kompatibilität
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = RelayTeam;
