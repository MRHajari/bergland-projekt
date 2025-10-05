// backend/models/accommodation.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Accommodation = sequelize.define("Accommodation", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
    street: { type: DataTypes.STRING },
    postal_code: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    single_rooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    double_rooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    multi_bed_rooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_beds: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: "accommodations",   // ✅ pluralisiert
    freezeTableName: true,         // ✅ verhindert doppelte Pluralisierung
});

module.exports = Accommodation;
