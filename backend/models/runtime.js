const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Runtime = sequelize.define(
    "runtime",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        event_registration_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },

        event_route_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        duration_seconds: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Laufzeit in Sekunden",
        },

        position: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        recorded_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "runtime",
        freezeTableName: true,
        timestamps: true,
    }
);

module.exports = Runtime;
