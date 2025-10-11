const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Person
 * Repräsentiert eine natürliche Person (Teilnehmer, Angehöriger, etc.)
 * owner_id zeigt an, welcher Benutzer (User oder Person) diese Person erstellt hat.
 */

const Person = sequelize.define(
    "person",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        // 👤 Vorname
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // 👤 Nachname
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        // 🎂 Geburtsdatum (optional)
        birth_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        // 📧 E-Mail-Adresse (optional, nicht eindeutig – da z. B. Kinder ohne eigene Mail)
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: false,
            validate: {
                isEmail: {
                    msg: "Bitte gültige E-Mail-Adresse eingeben",
                },
            },
        },

        // 🧑‍💼 Besitzer / Ersteller
        owner_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "person", // Self-reference (Person → Person)
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
    },
    {
        tableName: "person",
        timestamps: true,
        comment: "Personendaten – inklusive Besitzer-Referenz auf den Ersteller (owner)",
    }
);

// =============================================
// 🔗 Selbstreferenzielle Beziehung definieren
// =============================================
Person.belongsTo(Person, { as: "owner", foreignKey: "owner_id" });
Person.hasMany(Person, { as: "createdPersons", foreignKey: "owner_id" });

module.exports = Person;
