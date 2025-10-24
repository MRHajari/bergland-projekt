const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🏨 Occupancy Model
 * Beschreibt, wie viele Betten einer Unterkunft für ein bestimmtes Event reserviert sind
 * und wie viele davon bereits gebucht wurden.
 */
const Occupancy = sequelize.define(
    "occupancy",
    {
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

        // 🛏️ Gesamtkapazität für dieses Event
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

        // 📦 aktuell gebuchte Betten
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

        // 🧮 virtuelle Felder (werden automatisch berechnet)
        available_single: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.single_beds_total - this.single_beds_booked;
            },
        },
        available_double: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.double_beds_total - this.double_beds_booked;
            },
        },
        available_multi: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.multi_beds_total - this.multi_beds_booked;
            },
        },
    },
    {
        tableName: "occupancy",
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = Occupancy;
