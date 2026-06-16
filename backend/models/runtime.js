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

        participant_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        registration_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        event_route_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        route_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        start_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        finish_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        split_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        duration_seconds: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        indexes: [
            {
                unique: true,
                fields: ["participant_id", "event_route_id"],
            },
        ],
    }
);

module.exports = Runtime;