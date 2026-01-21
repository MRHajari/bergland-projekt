const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🏨 Occupancy Model
 * Beschreibt die Zimmerkapazitäten einer Unterkunft
 * für ein bestimmtes Event sowie deren Belegung.
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

        // =====================================================
        // 🛏️ Gesamtkapazität (Zimmer pro Typ)
        // =====================================================
        single_rooms_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        double_rooms_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        quad_rooms_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        quint_rooms_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sext_rooms_total: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        // =====================================================
        // 📦 Gebuchte Zimmer
        // =====================================================
        single_rooms_booked: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        double_rooms_booked: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        quad_rooms_booked: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        quint_rooms_booked: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        sext_rooms_booked: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        // =====================================================
        // 🧮 Verfügbare Zimmer (virtuell)
        // =====================================================
        available_single: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.single_rooms_total - this.single_rooms_booked;
            },
        },
        available_double: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.double_rooms_total - this.double_rooms_booked;
            },
        },
        available_quad: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.quad_rooms_total - this.quad_rooms_booked;
            },
        },
        available_quint: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.quint_rooms_total - this.quint_rooms_booked;
            },
        },
        available_sext: {
            type: DataTypes.VIRTUAL,
            get() {
                return this.sext_rooms_total - this.sext_rooms_booked;
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
