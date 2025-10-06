// backend/models/token.js
module.exports = (sequelize, DataTypes) => {
    const Token = sequelize.define(
        "Token",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            person_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            expires_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            revoked: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            tableName: "tokens",
            timestamps: false,
        }
    );

    return Token;
};
