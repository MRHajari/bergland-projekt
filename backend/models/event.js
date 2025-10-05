const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define("event", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
}, { tableName: "event" });

module.exports = Event;
