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
        length_km: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: true,
            comment: "Streckenlänge in km",
        },
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
        timestamps: true,
    }
);

module.exports = Route;
