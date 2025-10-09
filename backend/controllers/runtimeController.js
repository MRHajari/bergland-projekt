// backend/controllers/runtimeController.js
const { Runtime, Route, EventRegistration } = require("../models");
const runtimeSchema = require("../validators/runtimeValidator");

// ➕ Neue Laufzeit erstellen
exports.createRuntime = async (req, res, next) => {
    try {
        const { error } = runtimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const runtime = await Runtime.create(req.body);
        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Laufzeit:", err);
        next(err);
    }
};

// 📋 Alle Laufzeiten
exports.getAllRuntimes = async (req, res, next) => {
    try {
        const runtimes = await Runtime.findAll({
            include: [
                { model: EventRegistration, as: "eventRegistration" },
                { model: Route, as: "route" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeiten:", err);
        next(err);
    }
};

// 🔍 Laufzeiten einer bestimmten Anmeldung
exports.getByRegistration = async (req, res, next) => {
    try {
        const { registrationId } = req.params;
        const runtimes = await Runtime.findAll({
            where: { registration_id: registrationId },
            include: [{ model: Route, as: "route" }],
            order: [["createdAt", "DESC"]],
        });
        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeiten für Anmeldung:", err);
        next(err);
    }
};

// 🔎 Laufzeit per ID
exports.getRuntimeById = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id, {
            include: [
                { model: EventRegistration, as: "eventRegistration" },
                { model: Route, as: "route" },
            ],
        });
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });
        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Laufzeit:", err);
        next(err);
    }
};

// ✏️ Laufzeit aktualisieren
exports.updateRuntime = async (req, res, next) => {
    try {
        const { error } = runtimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });

        await runtime.update(req.body);
        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Laufzeit:", err);
        next(err);
    }
};

// ❌ Laufzeit löschen
exports.deleteRuntime = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });

        await runtime.destroy();
        res.json({ message: "Runtime deleted successfully" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Laufzeit:", err);
        next(err);
    }
};
