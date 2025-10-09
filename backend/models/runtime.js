// backend/models/runtime.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Runtime = sequelize.define(
    "runtime",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 Zuordnung zur Anmeldung
        registration_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🔗 Zugehörige Strecke
        route_id: {
            type: DataTypes.UUID,
            allowNull: false,
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

        // ⏱️ Gesamtdauer (optional)
        total_time: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: "Gesamtlaufzeit formatiert, z.B. 00:47:32",
        },
    },
    {
        tableName: "runtime",
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = Runtime;
