const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Registration = sequelize.define("registration", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    phone_number: DataTypes.STRING,
    participation_type: DataTypes.STRING, // z.B. 'single' | 'relay'
    wishes: DataTypes.STRING,
    person_id: { type: DataTypes.UUID, allowNull: false },
    event_id: { type: DataTypes.UUID, allowNull: false },
    relay_team_id: { type: DataTypes.UUID, allowNull: true },
}, { tableName: "registration" });

module.exports = Registration;
