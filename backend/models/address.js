const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Address = sequelize.define("address", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    street: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    person_id: { type: DataTypes.UUID, allowNull: false },
}, { tableName: "address" });

module.exports = Address;
