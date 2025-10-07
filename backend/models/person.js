const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Person = sequelize.define("person", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    // 🧹 Passwort entfernt — wird in LoginData gespeichert
}, {
    tableName: "person",
    underscored: true,
});

module.exports = Person;
