const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * 🫂 Staffel (Squadron)
 * Eine Staffel kann mehrere Anmeldungen (EventRegistrations) enthalten
 * und mehrere Personen über RelPersonSquadron.
 */
const Squadron = sequelize.define(
    "squadron",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 optional: Zugehöriges Event (wenn Staffeln eventabhängig sind)
        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'event', key: 'id' },
            onDelete: 'CASCADE'
        },


        // 🏁 Staffelname
        name: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },

        // 🔢 Startnummer oder Teamnummer
        start_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },

        // 🧑‍🤝‍🧑 Anzahl Mitglieder (kann automatisch gezählt werden)
        members_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },

        // 📝 Beschreibung oder Kommentar
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "squadron",
        freezeTableName: true,
        timestamps: true,
    }
);

// Hinweis: Beziehungen werden in models/index.js definiert.
// Squadron.belongsToMany(Person, { through: RelPersonSquadron });
// Squadron.hasMany(EventRegistration, { foreignKey: "squadron_id" });

module.exports = Squadron;
