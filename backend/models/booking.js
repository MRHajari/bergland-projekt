const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("booking", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    accommodation_id: { type: DataTypes.UUID, allowNull: false },
    person_id: { type: DataTypes.UUID, allowNull: true }, // optional laut deiner Beschreibung
}, { tableName: "booking" });

module.exports = Booking;
