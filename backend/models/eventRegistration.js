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

        // 👤 Wer hat diese Registrierung angelegt
        registered_by_person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🪪 Optionale Staffel-Zuordnung (Kopf, nicht Teilnehmer!)
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
        wishes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        club: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("In Bearbeitung", "bestätigt", "abgelehnt"),
            defaultValue: "In Bearbeitung",
        },
    },
    {
        tableName: "event_registration",
        timestamps: true,
    }
);

// ============================================================
// 🔗 Beziehungen
// ============================================================
EventRegistration.associate = (models) => {
    EventRegistration.belongsTo(models.Person, {
        as: "registered_by_person",
        foreignKey: "registered_by_person_id",
    });

    EventRegistration.belongsTo(models.Event, {
        as: "event",
        foreignKey: "event_id",
    });

    EventRegistration.belongsTo(models.Squadron, {
        as: "squadron",
        foreignKey: "squadron_id",
    });

    EventRegistration.hasMany(models.EventRegistrationParticipant, {
        as: "participants",
        foreignKey: "registration_id",
        onDelete: "CASCADE",
    });
};

module.exports = EventRegistration;
