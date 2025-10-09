// backend/controllers/relPersonAddressController.js
const { RelPersonAddress, Person, Address } = require("../models");
const { relPersonAddressSchema } = require("../validators/relPersonAddressValidator");

// ============================================================
// 🔹 Alle Beziehungen abrufen
// ============================================================
exports.getAll = async (req, res, next) => {
    try {
        const relations = await RelPersonAddress.findAll({
            include: [
                { model: Person, as: "person" },
                { model: Address, as: "address" },
            ],
        });
        res.json(relations);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// 🔹 Beziehung nach ID abrufen
// ============================================================
exports.getById = async (req, res, next) => {
    try {
        const relation = await RelPersonAddress.findByPk(req.params.id, {
            include: [
                { model: Person, as: "person" },
                { model: Address, as: "address" },
            ],
        });
        if (!relation) return res.status(404).json({ error: "Beziehung nicht gefunden" });
        res.json(relation);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// 🔹 Neue Beziehung anlegen
// ============================================================
exports.create = async (req, res, next) => {
    try {
        const { error, value } = relPersonAddressSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const newRelation = await RelPersonAddress.create(value);
        res.status(201).json(newRelation);
    } catch (err) {
        next(err);
    }
};

// ============================================================
// 🔹 Beziehung löschen
// ============================================================
exports.delete = async (req, res, next) => {
    try {
        const relation = await RelPersonAddress.findByPk(req.params.id);
        if (!relation) return res.status(404).json({ error: "Beziehung nicht gefunden" });

        await relation.destroy();
        res.json({ message: "Beziehung gelöscht" });
    } catch (err) {
        next(err);
    }
};
