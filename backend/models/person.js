const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Person = sequelize.define("person", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    first_name: { type: DataTypes.STRING, allowNull: false },
    last_name: { type: DataTypes.STRING, allowNull: false },
    birth_date: { type: DataTypes.DATEONLY, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
}, {
    tableName: "person",
    timestamps: true,
});

module.exports = Person;
