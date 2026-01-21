// backend/models/accommodation.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Accommodation = sequelize.define(
    "accommodation",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        street: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        postal_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // =====================================================
        // 🛏️ Kapazitäten (LEGACY + NEU)
        // =====================================================

        // 🔹 Bestehende Felder – NICHT anfassen
        single_rooms: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "Anzahl Einzelzimmer",
        },
        double_rooms: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "Anzahl Doppelzimmer",
        },
        quad_rooms: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "Anzahl 4-Bett-Zimmer",
        },
        quint_rooms: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "Anzahl 5-Bett-Zimmer",
        },
        sext_rooms: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "Anzahl 6-Bett-Zimmer",
        },

        // ⚠️ bleibt vorerst bestehen (wird später sauber berechnet)
        total_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: "Gesamtanzahl Betten (Legacy / optional)",
        },

        // 🟢 Optional
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "accommodation",
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = Accommodation;
