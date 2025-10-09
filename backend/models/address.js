const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Adresse = sequelize.define("adresse", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    street: { type: DataTypes.STRING, allowNull: false },
    postal_code: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: "adresse",
    timestamps: true,
});

module.exports = Adresse;
