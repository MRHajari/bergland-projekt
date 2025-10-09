// backend/controllers/relayTeamController.js
const { RelayTeam, Event, Route } = require("../models");
const relayTeamSchema = require("../validators/relayTeamValidator");

// ➕ Neuer Lauftag erstellen
exports.createRelayTeam = async (req, res, next) => {
    try {
        const { error } = relayTeamSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const relayTeam = await RelayTeam.create(req.body);
        res.json(relayTeam);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen des Lauftags:", err);
        next(err);
    }
};

// 📋 Alle Lauftage
exports.getAllRelayTeams = async (req, res, next) => {
    try {
        const relayTeams = await RelayTeam.findAll({
            include: [
                { model: Event, as: "event" },
                { model: Route, as: "route" },
            ],
            order: [["run_date", "ASC"]],
        });
        res.json(relayTeams);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Lauftage:", err);
        next(err);
    }
};

// 🔍 Lauftage eines bestimmten Events
exports.getByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const relayTeams = await RelayTeam.findAll({
            where: { event_id: eventId },
            include: [{ model: Route, as: "route" }],
            order: [["run_date", "ASC"]],
        });
        res.json(relayTeams);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Lauftage für Event:", err);
        next(err);
    }
};

// 🔎 Lauftag per ID
exports.getRelayTeamById = async (req, res, next) => {
    try {
        const relayTeam = await RelayTeam.findByPk(req.params.id, {
            include: [
                { model: Event, as: "event" },
                { model: Route, as: "route" },
            ],
        });
        if (!relayTeam) return res.status(404).json({ error: "Lauftag nicht gefunden" });
        res.json(relayTeam);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen des Lauftags:", err);
        next(err);
    }
};

// ✏️ Lauftag aktualisieren
exports.updateRelayTeam = async (req, res, next) => {
    try {
        const { error } = relayTeamSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const relayTeam = await RelayTeam.findByPk(req.params.id);
        if (!relayTeam) return res.status(404).json({ error: "Lauftag nicht gefunden" });

        await relayTeam.update(req.body);
        res.json(relayTeam);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren des Lauftags:", err);
        next(err);
    }
};

// ❌ Lauftag löschen
exports.deleteRelayTeam = async (req, res, next) => {
    try {
        const relayTeam = await RelayTeam.findByPk(req.params.id);
        if (!relayTeam) return res.status(404).json({ error: "Lauftag nicht gefunden" });

        await relayTeam.destroy();
        res.json({ message: "Lauftag erfolgreich gelöscht" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen des Lauftags:", err);
        next(err);
    }
};
