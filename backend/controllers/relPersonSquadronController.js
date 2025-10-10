const { RelPersonSquadron, Person, Squadron } = require("../models");
const relPersonSquadronSchema = require("../validators/relPersonSquadronValidator");

// ➕ Person einer Staffel hinzufügen
exports.addPersonToSquadron = async (req, res, next) => {
    try {
        const { error } = relPersonSquadronSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const relation = await RelPersonSquadron.create(req.body);
        res.status(201).json(relation);
    } catch (err) {
        console.error("❌ Fehler beim Hinzufügen der Person zur Staffel:", err);
        next(err);
    }
};

// 📋 Alle Zuordnungen laden
exports.getAllRelations = async (req, res, next) => {
    try {
        const relations = await RelPersonSquadron.findAll({
            include: [
                { model: Person, attributes: ["id", "first_name", "last_name", "email"] },
                { model: Squadron, attributes: ["id", "name"] },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(relations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Relationen:", err);
        next(err);
    }
};

// 🔍 Mitglieder einer bestimmten Staffel laden
exports.getPersonsBySquadron = async (req, res, next) => {
    try {
        const { squadronId } = req.params;
        const relations = await RelPersonSquadron.findAll({
            where: { squadron_id: squadronId },
            include: [{ model: Person, attributes: ["id", "first_name", "last_name", "email"] }],
        });
        res.json(relations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Mitglieder:", err);
        next(err);
    }
};

// 🔍 Staffeln einer bestimmten Person laden
exports.getSquadronsByPerson = async (req, res, next) => {
    try {
        const { personId } = req.params;
        const relations = await RelPersonSquadron.findAll({
            where: { person_id: personId },
            include: [{ model: Squadron, attributes: ["id", "name", "start_number"] }],
        });
        res.json(relations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Staffeln der Person:", err);
        next(err);
    }
};

// ❌ Person aus Staffel entfernen
exports.removeRelation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const relation = await RelPersonSquadron.findByPk(id);
        if (!relation) return res.status(404).json({ error: "Relation not found" });

        await relation.destroy();
        res.json({ message: "Relation deleted successfully" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Relation:", err);
        next(err);
    }
};
