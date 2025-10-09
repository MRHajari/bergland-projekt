const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Occupancy = sequelize.define("occupancy", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    // 🔗 Unterkunft
    accommodation_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },

    // 🔗 Event
    event_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },

    // 🛏️ Anzahl verfügbarer Betten/Zimmer für dieses Event
    single_beds_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    double_beds_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    multi_beds_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    // 📦 aktuelle Belegung
    single_beds_booked: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    double_beds_booked: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    multi_beds_booked: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: "occupancy",
    freezeTableName: true,
    timestamps: true,
});

module.exports = Occupancy;
