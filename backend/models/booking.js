// backend/models/booking.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("booking", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    person_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    accommodation_id: {
        type: DataTypes.UUID,
        allowNull: true,
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
    freezeTableName: true,
    timestamps: true, // ✅ Sequelize erstellt createdAt & updatedAt automatisch
});

module.exports = Booking;
