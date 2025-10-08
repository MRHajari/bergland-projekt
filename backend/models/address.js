const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Address = sequelize.define("address", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    person_id: { type: DataTypes.UUID, allowNull: false },
    street: { type: DataTypes.STRING, allowNull: false },
    postal_code: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: "address",
    timestamps: true,
});

module.exports = Address;
