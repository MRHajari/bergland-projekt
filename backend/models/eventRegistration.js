const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventRegistration = sequelize.define(
    "event_registration",
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

        // 👤 Wer hat diese Registrierung angelegt (statt user_id)
        registered_by_person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🪪 Optionale Staffel-Zuordnung
        squadron_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        // 📞 Kopf-Felder der Registrierung
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        license_plate: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        start_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        catering_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        wishes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM("m", "w", "d"),
            allowNull: true,
        },
        club: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("in_auswahl", "bestätigt", "abgelehnt"),
            defaultValue: "in_auswahl",
        },
    },
    {
        tableName: "event_registration",
        timestamps: true,
    }
);

// ============================================================
// 🔗 Beziehungen (Associations)
// ============================================================
EventRegistration.associate = (models) => {
    // 👤 Person, die die Registrierung angelegt hat
    EventRegistration.belongsTo(models.Person, {
        as: "registered_by_person",
        foreignKey: "registered_by_person_id",
    });

    // 🏔️ Zugehöriges Event
    EventRegistration.belongsTo(models.Event, {
        as: "event",
        foreignKey: "event_id",
    });

    // 🪪 Zugehörige Staffel (optional)
    EventRegistration.belongsTo(models.Squadron, {
        as: "squadron",
        foreignKey: "squadron_id",
    });

    // 👥 Teilnehmer dieser Gruppen-Registrierung
    EventRegistration.hasMany(models.EventRegistrationParticipant, {
        as: "participants",
        foreignKey: "registration_id",
        onDelete: "CASCADE",
    });
};

module.exports = EventRegistration;
