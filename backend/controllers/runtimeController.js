const {
    Runtime,
    EventRegistration,
    EventRoute,
    User,
    Event,
    Route
} = require("../models");

const { runtimeSchema } = require("../validators/runtimeValidator");


// ============================================================
// ➕ Neue Laufzeit
// ============================================================
exports.createRuntime = async (req, res, next) => {
    try {
        const { error, value } = runtimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { event_registration_id, event_route_id, duration_seconds } = value;

        // Registrierung prüfen
        const registration = await EventRegistration.findByPk(event_registration_id);
        if (!registration)
            return res.status(404).json({ error: "Registration nicht gefunden." });

        // EventRoute prüfen
        const eventRoute = await EventRoute.findByPk(event_route_id);
        if (!eventRoute)
            return res.status(404).json({ error: "EventRoute nicht gefunden." });

        // Sicherheitscheck: gleiche Event-Zuordnung
        if (registration.event_id !== eventRoute.event_id)
            return res.status(400).json({
                error: "Registration gehört nicht zu diesem Event.",
            });

        // prüfen ob runtime für diese kombination existiert
        const exists = await Runtime.findOne({
            where: {
                event_registration_id,
                event_route_id
            }
        });

        if (exists)
            return res.status(400).json({
                error: "Für diese Strecke existiert bereits eine Laufzeit.",
            });

        const runtime = await Runtime.create({
            event_registration_id,
            event_route_id,
            duration_seconds,
            recorded_by: req.user.id,
        });

        res.status(201).json(runtime);

    } catch (err) {
        console.error("❌ Fehler createRuntime:", err);
        next(err);
    }
};


// ============================================================
// 📋 Alle Laufzeiten
// ============================================================
exports.getAllRuntimes = async (req, res, next) => {
    try {
        const runtimes = await Runtime.findAll({
            include: [
                { model: EventRegistration, as: "registration" },
                {
                    model: EventRoute,
                    as: "eventRoute",
                    include: [
                        { model: Event, as: "event" },
                        { model: Route, as: "route" }
                    ]
                },
                { model: User, as: "timekeeper", attributes: ["id", "email"] }
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler getAllRuntimes:", err);
        next(err);
    }
};


// ============================================================
// 🔍 Laufzeit per ID
// ============================================================
exports.getRuntimeById = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id, {
            include: [
                { model: EventRegistration, as: "registration" },
                { model: EventRoute, as: "eventRoute" },
                { model: User, as: "timekeeper" },
            ],
        });

        if (!runtime)
            return res.status(404).json({ error: "Runtime nicht gefunden." });

        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler getRuntimeById:", err);
        next(err);
    }
};


// ============================================================
// 🔍 Laufzeiten einer Anmeldung
// ============================================================
exports.getByRegistration = async (req, res, next) => {
    try {
        const runtimes = await Runtime.findAll({
            where: { event_registration_id: req.params.registrationId },
            include: [
                { model: EventRoute, as: "eventRoute" },
                { model: User, as: "timekeeper" }
            ]
        });

        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler getByRegistration:", err);
        next(err);
    }
};


// ============================================================
// ✏️ Laufzeit ändern
// ============================================================
exports.updateRuntime = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime)
            return res.status(404).json({ error: "Runtime nicht gefunden." });

        const { error, value } = runtimeSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        await runtime.update({
            duration_seconds: value.duration_seconds,
            recorded_by: req.user.id,
        });

        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler updateRuntime:", err);
        next(err);
    }
};


// ============================================================
// ❌ Löschen
// ============================================================
exports.deleteRuntime = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime)
            return res.status(404).json({ error: "Runtime nicht gefunden." });

        await runtime.destroy();
        res.json({ message: "Runtime gelöscht." });
    } catch (err) {
        console.error("❌ Fehler deleteRuntime:", err);
        next(err);
    }
};
