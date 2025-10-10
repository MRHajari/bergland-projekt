const { Runtime, EventRegistration, Person, Route } = require("../models");
const { runtimeSchema } = require("../validators/runtimeValidator");

// ➕ Neue Laufzeit anlegen
exports.createRuntime = async (req, res, next) => {
    try {
        const { error } = runtimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const runtime = await Runtime.create(req.body);
        res.status(201).json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Laufzeit:", err);
        next(err);
    }
};

// 📋 Alle Laufzeiten laden
exports.getAllRuntimes = async (req, res, next) => {
    try {
        const runtimes = await Runtime.findAll({
            include: [
                { model: Person, attributes: ["id", "first_name", "last_name", "email"] },
                { model: EventRegistration, attributes: ["id", "participation_type", "status"] },
                { model: Route, attributes: ["id", "name", "distance"] },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeiten:", err);
        next(err);
    }
};

// 🔍 Einzelne Laufzeit per ID
exports.getRuntimeById = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id, {
            include: [
                { model: Person, attributes: ["id", "first_name", "last_name"] },
                { model: EventRegistration, attributes: ["id", "participation_type"] },
                { model: Route, attributes: ["id", "name", "distance"] },
            ],
        });
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });
        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeit:", err);
        next(err);
    }
};

// 🔍 Laufzeiten einer bestimmten Person
exports.getByPerson = async (req, res, next) => {
    try {
        const { personId } = req.params;
        const runtimes = await Runtime.findAll({
            where: { person_id: personId },
            include: [
                { model: EventRegistration, attributes: ["id", "participation_type", "status"] },
                { model: Route, attributes: ["id", "name", "distance"] },
            ],
        });
        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeiten einer Person:", err);
        next(err);
    }
};

// 🔍 Laufzeiten zu einer bestimmten Anmeldung
exports.getByRegistration = async (req, res, next) => {
    try {
        const { registrationId } = req.params;
        const runtimes = await Runtime.findAll({
            where: { event_registration_id: registrationId },
            include: [
                { model: Person, attributes: ["id", "first_name", "last_name"] },
                { model: Route, attributes: ["id", "name", "distance"] },
            ],
        });
        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeiten für Anmeldung:", err);
        next(err);
    }
};

// ✏️ Laufzeit aktualisieren
exports.updateRuntime = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });

        const { error } = runtimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

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
