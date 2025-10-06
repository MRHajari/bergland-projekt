// backend/models/belegung.js
module.exports = (sequelize, DataTypes) => {
    const Belegung = sequelize.define(
        "Belegung",
        {
            id_belegung: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            id_unterkunft: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            id_event: {
                type: DataTypes.UUID, // ✅ UUID, passend zu Event.id
                allowNull: false,
            },
            id_person: {
                type: DataTypes.INTEGER, // ✅ Person-ID (vermutlich INT)
                allowNull: false,
            },
        },
        {
            tableName: "belegung",
            timestamps: false,
        }
    );

    return Belegung;
};
