const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Person
 * Repräsentiert eine natürliche Person (Teilnehmer, Angehöriger, etc.)
 * owner_id zeigt auf den Benutzer (User), der diese Person erstellt hat.
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

        // 📧 E-Mail-Adresse (optional, nicht eindeutig)
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

        // ☎️ Telefonnummer (optional)
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // 🏠 Straße und Hausnummer
        street: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // 🏙️ PLZ
        postal_code: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // 📍 Ort
        city: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        // 🌍 Land
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        gender: {
            type: DataTypes.ENUM('m', 'w', 'd'),
            allowNull: true,
            comment: 'Geschlecht der Person',
        },

        // 🧑‍💼 Besitzer / Ersteller (User)
        owner_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "user", // verweist auf Tabelle "user"
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
    },
    {
        tableName: "person",
        timestamps: true,
        comment:
            "Personendaten – inkl. Adress- und Besitzer-Informationen (owner_id → user.id)",
    }
);

module.exports = Person;
