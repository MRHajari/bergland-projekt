// backend/config/db.js
require('dotenv').config();
const { Sequelize } = require("sequelize");
const path = require("path");

const isSqlite = (process.env.DB_DIALECT || "sqlite") === "sqlite";

let sequelize;

if (isSqlite) {
    const storageRel = process.env.DB_STORAGE || "./db/database.sqlite";
    const storage = path.isAbsolute(storageRel)
        ? storageRel
        : path.resolve(__dirname, "..", storageRel);

    console.log("[Sequelize runtime] SQLite storage:", storage);

    sequelize = new Sequelize({
        dialect: "sqlite",
        storage,
        logging: false,
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            dialect: process.env.DB_DIALECT || "mysql",
            logging: false
        }
    );
}

module.exports = sequelize;
