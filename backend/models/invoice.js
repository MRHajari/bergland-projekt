const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Invoice = sequelize.define("invoice", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    invoice_number: {
        type: DataTypes.STRING,
        unique: true
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    person_id: {
        type: DataTypes.UUID,
        allowNull: false
    },

    // ✅ Neu hinzugefügt: Status, ob bezahlt oder nicht
    is_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: "invoice",
    freezeTableName: true
});

module.exports = Invoice;
