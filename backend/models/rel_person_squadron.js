const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🔗 RelPersonSquadron
 * Verknüpfungstabelle zwischen Person und Squadron (n:m)
 * 
 * Eine Person kann in mehreren Staffeln (Squadrons) sein.
 * Eine Staffel kann mehrere Personen enthalten.
 */
const RelPersonSquadron = sequelize.define(
    "rel_person_squadron",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        // 👤 Zugehörige Person
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🫂 Zugehörige Staffel
        squadron_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 📝 Optionale Beschreibung (z. B. Kommentar zur Teilnahme)
        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "rel_person_squadron",
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = RelPersonSquadron;
