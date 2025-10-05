// backend/config/config.js
require('dotenv').config();
const path = require('path');

const storageRel = process.env.DB_STORAGE || "./db/database.sqlite";
const storage = path.isAbsolute(storageRel)
    ? storageRel
    : path.resolve(__dirname, "..", storageRel);

console.log("[Sequelize CLI] SQLite storage:", storage);

module.exports = {
    development: { dialect: 'sqlite', storage, logging: console.log },
    test: { dialect: 'sqlite', storage: ':memory:', logging: false },
    production: { dialect: 'sqlite', storage, logging: false },
};
