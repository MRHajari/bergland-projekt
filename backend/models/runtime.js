const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Runtime = sequelize.define("runtime", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    duration: DataTypes.STRING, // "HH:MM:SS" als Text
    registration_id: { type: DataTypes.UUID, allowNull: false, unique: true }, // 1:1
}, { tableName: "runtime" });

module.exports = Runtime;
