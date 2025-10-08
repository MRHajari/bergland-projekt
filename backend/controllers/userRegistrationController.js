// controllers/userRegistrationController.js
const { UserRegistration } = require("../models");

exports.create = async (req, res) => {
    try {
        const data = await UserRegistration.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der UserRegistration:", err);
        res.status(500).json({ error: "Fehler beim Erstellen der Registrierung" });
    }
};

exports.findAll = async (req, res) => {
    try {
        const list = await UserRegistration.findAll();
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Fehler beim Laden der Registrierungen" });
    }
};

exports.findById = async (req, res) => {
    try {
        const entry = await UserRegistration.findByPk(req.params.id);
        if (!entry) return res.status(404).json({ error: "Nicht gefunden" });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: "Fehler beim Laden" });
    }
};

exports.delete = async (req, res) => {
    try {
        const count = await UserRegistration.destroy({ where: { id: req.params.id } });
        if (!count) return res.status(404).json({ error: "Nicht gefunden" });
        res.json({ message: "Erfolgreich gelöscht" });
    } catch (err) {
        res.status(500).json({ error: "Fehler beim Löschen" });
    }
};
