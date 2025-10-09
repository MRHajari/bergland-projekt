// backend/controllers/addressController.js
const { Address, Person } = require("../models");
const { addressSchema } = require("../validators/addressValidator");

// ============================================================
// 🔹 Alle Adressen abrufen
// ============================================================
exports.getAll = async (req, res, next) => {
    try {
        const addresses = await Address.findAll({ include: [{ model: Person, as: "person" }] });
        res.json(addresses);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// 🔹 Adresse nach ID abrufen
// ============================================================
exports.getById = async (req, res, next) => {
    try {
        const address = await Address.findByPk(req.params.id, {
            include: [{ model: Person, as: "person" }],
        });
        if (!address) return res.status(404).json({ error: "Adresse nicht gefunden" });
        res.json(address);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// 🔹 Neue Adresse erstellen
// ============================================================
exports.create = async (req, res, next) => {
    try {
        const { error, value } = addressSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const newAddress = await Address.create(value);
        res.status(201).json(newAddress);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// 🔹 Adresse aktualisieren
// ============================================================
exports.update = async (req, res, next) => {
    try {
        const { error, value } = addressSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const address = await Address.findByPk(req.params.id);
        if (!address) return res.status(404).json({ error: "Adresse nicht gefunden" });

        await address.update(value);
        res.json({ message: "Adresse aktualisiert", address });
    } catch (err) {
        next(err);
    }
};

// ============================================================
// 🔹 Adresse löschen
// ============================================================
exports.delete = async (req, res, next) => {
    try {
        const address = await Address.findByPk(req.params.id);
        if (!address) return res.status(404).json({ error: "Adresse nicht gefunden" });

        await address.destroy();
        res.json({ message: "Adresse gelöscht" });
    } catch (err) {
        next(err);
    }
};
