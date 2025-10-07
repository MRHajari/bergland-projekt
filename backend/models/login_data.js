const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LoginData = sequelize.define(
    "login_data",
    {
        id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
        person_id: { type: DataTypes.UUID, allowNull: false },
        password_hash: { type: DataTypes.STRING, allowNull: false },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "user",
            validate: { isIn: [["user", "admin"]] },
        },
        last_login_at: { type: DataTypes.DATE, allowNull: true },
    },
    { tableName: "login_data", underscored: true }
);

module.exports = LoginData;
