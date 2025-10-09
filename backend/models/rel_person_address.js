// backend/models/rel_person_address.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RelPersonAddress = sequelize.define(
    "rel_person_address",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        person_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        address_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        gueltig_bis: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "rel_person_address",
        timestamps: false,
    }
);

module.exports = RelPersonAddress;
