const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserRegistration = sequelize.define("user_registration", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    birth_date: { type: DataTypes.DATEONLY, allowNull: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: "user_registration",
    timestamps: true,
});

module.exports = UserRegistration;
