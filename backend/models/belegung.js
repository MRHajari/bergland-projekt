// backend/models/belegung.js
module.exports = (sequelize, DataTypes) => {
    const Belegung = sequelize.define("Belegung", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        id_event: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        id_person: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        tableName: "belegung",
        timestamps: true,
    });

    // 🔹 Beziehungen
    Belegung.associate = (models) => {
        Belegung.belongsTo(models.Person, {
            foreignKey: "id_person",
            as: "person",
        });

        Belegung.belongsTo(models.Event, {
            foreignKey: "id_event",
            as: "event",
        });
    };

    return Belegung;
};
