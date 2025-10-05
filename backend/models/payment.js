const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define("payment", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    payment_date: DataTypes.DATE,
    amount: DataTypes.FLOAT,
    invoice_id: { type: DataTypes.UUID, allowNull: false },
}, { tableName: "payment" });

module.exports = Payment;
