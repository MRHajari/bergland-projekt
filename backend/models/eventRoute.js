// backend/models/eventRoute.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EventRoute = sequelize.define(
    "event_route",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        route_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // optional: wenn du im Diagramm "Lauftag" = Datum/Zeitslot meinst
        day_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },

        start_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        note: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "event_route",
        freezeTableName: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["event_id", "route_id", "day_date", "start_time"],
            },
        ],
    }
);

module.exports = EventRoute;
