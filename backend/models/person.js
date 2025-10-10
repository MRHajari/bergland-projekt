const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Person
 * Repräsentiert eine natürliche Person (Teilnehmer, Angehöriger, etc.)
 * owner_id zeigt an, welcher Benutzer (User) diese Person erstellt hat.
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

        // 📧 E-Mail-Adresse (muss eindeutig sein)
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        // 🧑‍💼 Besitzer / Ersteller (User-ID)
        owner_id: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: "User-ID des Erstellers dieser Person (Accountinhaber)",
        },
    },
    {
        tableName: "person",
        timestamps: true,
        comment: "Personendaten – inklusive Besitzer-Referenz auf den Benutzer (owner)",
    }
);

module.exports = Person;
