// backend/models/route.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Route = sequelize.define(
    "route",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },

        // 🔗 gehört zu einem Event
        event_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        // 🏞️ Strecke
        name: {
            type: DataTypes.STRING(180),
            allowNull: false,
            comment: "Streckenname",
        },
        start_point: {
            type: DataTypes.STRING(180),
            allowNull: true,
        },
        end_point: {
            type: DataTypes.STRING(180),
            allowNull: true,
        },

        // 📏 Länge in km, z.B. 10.5
        length_km: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            comment: "Streckenlänge in km",
        },

        // ⛰️ Höhenmeter in m, z.B. 350
        elevation_m: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: "Höhenmeter in m",
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "route",
        freezeTableName: true,
        timestamps: true, // createdAt / updatedAt
    }
);

module.exports = Route;
