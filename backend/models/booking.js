const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🏨 Booking Model
 * Repräsentiert eine Unterkunftsbuchung im Rahmen einer Event-Registrierung.
 */
const Booking = sequelize.define(
    "booking",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 Verknüpfung zur EventRegistration
        event_registration_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zur EventRegistration (onDelete: CASCADE)",
        },

        // 🔗 Direkte Verbindung zum Event
        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zum Event",
        },

        // 👤 Wer hat die Buchung erstellt
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zum User",
        },

        // 🏨 Unterkunft
        accommodation_id: {
            type: DataTypes.UUID,
            allowNull: false,
            comment: "Referenz zur gebuchten Unterkunft",
        },

        // =====================================================
        // 🛏️ Anzahl gebuchter Betten (LEGACY)
        // =====================================================
        single_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
        },
        double_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
        },

        quad_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
            comment: "4-Bett-Zimmer",
        },
        quint_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
            comment: "5-Bett-Zimmer",
        },
        sext_beds: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: { min: 0 },
            comment: "6-Bett-Zimmer",
        },
    },
    {
        tableName: "booking",
        freezeTableName: true,
        timestamps: true,
    }
);

// ============================================================
// 🔗 ASSOCIATIONS (UNVERÄNDERT)
// ============================================================
Booking.associate = (models) => {
    Booking.belongsTo(models.EventRegistration, {
        as: "eventRegistration",
        foreignKey: "event_registration_id",
        onDelete: "CASCADE",
    });

    Booking.belongsTo(models.Event, {
        as: "event",
        foreignKey: "event_id",
    });

    Booking.belongsTo(models.User, {
        as: "user",
        foreignKey: "user_id",
    });

    Booking.belongsTo(models.Accommodation, {
        as: "accommodation",
        foreignKey: "accommodation_id",
    });
};

module.exports = Booking;
