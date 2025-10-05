const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Route = sequelize.define("route", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: DataTypes.STRING,
    distance_km: DataTypes.FLOAT,
    event_id: { type: DataTypes.UUID, allowNull: false },
}, { tableName: "route" });

module.exports = Route;
