const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RelayTeam = sequelize.define("relay_team", {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: "relay_team",
    freezeTableName: true,
});

module.exports = RelayTeam;
