// backend/models/accommodation.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Accommodation = sequelize.define("accommodation", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    street: { type: DataTypes.STRING, allowNull: false },
    postal_code: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    single_rooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    double_rooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    multi_bed_rooms: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_beds: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: "accommodation",
    freezeTableName: true,
    timestamps: true // ✅ WICHTIG! Sonst fehlt createdAt/updatedAt
});

module.exports = Accommodation;
