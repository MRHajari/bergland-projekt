// backend/controllers/loginDataController.js
const { LoginData } = require("../models");
const bcrypt = require("bcrypt");
const loginDataSchema = require("../validators/loginDataValidator");

// Create
exports.createLoginData = async (req, res, next) => {
    try {
        const { error, value } = loginDataSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { person_id, password, role } = value;
        const password_hash = await bcrypt.hash(password, 10);

        const login = await LoginData.create({ person_id, password_hash, role: role || "user" });
        res.json({ id: login.id, person_id: login.person_id, role: login.role });
    } catch (err) { next(err); }
};

// Read all
exports.getAllLoginData = async (req, res, next) => {
    try {
        const logins = await LoginData.findAll({ attributes: ["id", "person_id", "role", "last_login_at", "created_at", "updated_at"] });
        res.json(logins);
    } catch (err) { next(err); }
};

// Read one
exports.getLoginDataById = async (req, res, next) => {
    try {
        const login = await LoginData.findByPk(req.params.id, { attributes: ["id", "person_id", "role", "last_login_at", "created_at", "updated_at"] });
        if (!login) return res.status(404).json({ error: "Login data not found" });
        res.json(login);
    } catch (err) { next(err); }
};

// Update (optional Passwort)
exports.updateLoginData = async (req, res, next) => {
    try {
        // Password optional -> eigenes Schema/Manuell prüfen:
        const { role, password } = req.body;
        const login = await LoginData.findByPk(req.params.id);
        if (!login) return res.status(404).json({ error: "Login data not found" });

        const updateData = {};
        if (role) updateData.role = role;
        if (password) updateData.password_hash = await bcrypt.hash(password, 10);

        await login.update(updateData);
        res.json({ id: login.id, person_id: login.person_id, role: login.role, last_login_at: login.last_login_at });
    } catch (err) { next(err); }
};

// Delete
exports.deleteLoginData = async (req, res, next) => {
    try {
        const login = await LoginData.findByPk(req.params.id);
        if (!login) return res.status(404).json({ error: "Login data not found" });
        await login.destroy();
        res.json({ message: "Login data deleted" });
    } catch (err) { next(err); }
};

// Update only the role
exports.updateRole = async (req, res, next) => {
    try {
        const { personId } = req.params;
        const { role } = req.body;

        const login = await LoginData.findOne({ where: { person_id: personId } });
        if (!login) return res.status(404).json({ error: "Login not found" });

        login.role = role;
        await login.save();

        res.json({ message: "Role updated", role });
    } catch (err) {
        next(err);
    }
};

