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
        name: { type: DataTypes.STRING, allowNull: false }, // unterkunft_name
        street: { type: DataTypes.STRING, allowNull: false }, // straße_und_hausnr
        postal_code: { type: DataTypes.STRING, allowNull: false }, // plz
        city: { type: DataTypes.STRING, allowNull: false }, // ort
        country: { type: DataTypes.STRING, allowNull: false },

        // 🛏️ Kapazitäten
        single_rooms: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Anzahl Einzelzimmer" }, // anz_ez
        double_rooms: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Anzahl Doppelzimmer" }, // anz_dz
        multi_bed_rooms: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Anzahl Mehrbettzimmer" }, // anz_mbz
        total_beds: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Gesamtanzahl Betten" }, // anz_betten_mbz

        // 🟢 Optional: Beschreibung
        description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
        tableName: "accommodation",
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = Accommodation;
