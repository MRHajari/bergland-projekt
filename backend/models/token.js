const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Token = sequelize.define(
    "token",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        tableName: "token",
        timestamps: true,
    }
);

module.exports = Token;
