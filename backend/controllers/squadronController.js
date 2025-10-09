// backend/controllers/squadronController.js
const { Squadron, Event, EventRegistration } = require("../models");
const squadronSchema = require("../validators/squadronValidator");

// ➕ Neue Staffel erstellen
exports.createSquadron = async (req, res, next) => {
    try {
        const { error } = squadronSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const squadron = await Squadron.create(req.body);
        res.json(squadron);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Staffel:", err);
        next(err);
    }
};

// 📋 Alle Staffeln
exports.getAllSquadrons = async (req, res, next) => {
    try {
        const squadrons = await Squadron.findAll({
            include: [
                { model: Event, as: "event" },
                { model: EventRegistration, as: "eventRegistrations" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(squadrons);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Staffeln:", err);
        next(err);
    }
};

// 🔍 Staffeln eines bestimmten Events
exports.getByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const squadrons = await Squadron.findAll({
            where: { event_id: eventId },
            include: [{ model: EventRegistration, as: "eventRegistrations" }],
        });
        res.json(squadrons);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Staffeln für Event:", err);
        next(err);
    }
};

// 🔎 Staffel per ID
exports.getSquadronById = async (req, res, next) => {
    try {
        const squadron = await Squadron.findByPk(req.params.id, {
            include: [
                { model: Event, as: "event" },
                { model: EventRegistration, as: "eventRegistrations" },
            ],
        });
        if (!squadron) return res.status(404).json({ error: "Squadron not found" });
        res.json(squadron);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Staffel:", err);
        next(err);
    }
};

// ✏️ Staffel aktualisieren
exports.updateSquadron = async (req, res, next) => {
    try {
        const { error } = squadronSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const squadron = await Squadron.findByPk(req.params.id);
        if (!squadron) return res.status(404).json({ error: "Squadron not found" });

        await squadron.update(req.body);
        res.json(squadron);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Staffel:", err);
        next(err);
    }
};

// ❌ Staffel löschen
exports.deleteSquadron = async (req, res, next) => {
    try {
        const squadron = await Squadron.findByPk(req.params.id);
        if (!squadron) return res.status(404).json({ error: "Squadron not found" });

        await squadron.destroy();
        res.json({ message: "Squadron deleted successfully" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Staffel:", err);
        next(err);
    }
};
