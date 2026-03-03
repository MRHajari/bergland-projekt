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

        event_route_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        duration_seconds: {
            type: DataTypes.INTEGER,
            allowNull: false,
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