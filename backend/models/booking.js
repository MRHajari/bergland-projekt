const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("booking", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    accommodation_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    person_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    single_beds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    double_beds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    multi_beds: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: "booking",
    timestamps: true,
});

module.exports = Booking;
