const {
    Runtime,
    EventRegistration,
    RelayTeam,
    User,
    Event
} = require("../models");

const { runtimeSchema } = require("../validators/runtimeValidator");


// ============================================================
// ➕ Neue Laufzeit anlegen
// ============================================================
exports.createRuntime = async (req, res, next) => {
    try {
        const { error, value } = runtimeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { event_registration_id, event_route_id, duration_seconds } = value;

        // 🔍 Registrierung prüfen
        const registration = await EventRegistration.findByPk(event_registration_id);
        if (!registration) {
            return res.status(404).json({ error: "EventRegistration nicht gefunden." });
        }

        // 🔍 RelayTeam prüfen
        const relayTeam = await RelayTeam.findByPk(event_route_id);
        if (!relayTeam) {
            return res.status(404).json({ error: "Lauftag nicht gefunden." });
        }

        // 🔒 Sicherheitscheck: Registration muss zum selben Event gehören
        if (registration.event_id !== relayTeam.event_id) {
            return res.status(400).json({
                error: "Anmeldung gehört nicht zu diesem Event.",
            });
        }

        // 🔍 Prüfen ob bereits Runtime existiert
        const existing = await Runtime.findOne({
            where: { event_registration_id },
        });

        if (existing) {
            return res.status(400).json({
                error: "Für diese Anmeldung existiert bereits eine Laufzeit.",
            });
        }

        const runtime = await Runtime.create({
            event_registration_id,
            event_route_id,
            duration_seconds,
            recorded_by: req.user.id,
        });

        res.status(201).json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Laufzeit:", err);
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
                {
                    model: EventRegistration,
                    as: "registration",
                },
                {
                    model: RelayTeam,
                    as: "eventRoute",
                    include: [
                        { model: Event, as: "event" }
                    ]
                },
                {
                    model: User,
                    as: "timekeeper",
                    attributes: ["id", "email"]
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeiten:", err);
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
                { model: RelayTeam, as: "eventRoute" },
                { model: User, as: "timekeeper" },
            ],
        });

        if (!runtime) {
            return res.status(404).json({ error: "Runtime nicht gefunden." });
        }

        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeit:", err);
        next(err);
    }
};



// ============================================================
// 🔍 Laufzeit zu einer bestimmten Anmeldung
// ============================================================
exports.getByRegistration = async (req, res, next) => {
    try {
        const { registrationId } = req.params;

        const runtime = await Runtime.findOne({
            where: { event_registration_id: registrationId },
            include: [
                { model: RelayTeam, as: "eventRoute" },
                { model: User, as: "timekeeper" },
            ],
        });

        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Laufzeit:", err);
        next(err);
    }
};



// ============================================================
// ✏️ Laufzeit aktualisieren
// ============================================================
exports.updateRuntime = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) {
            return res.status(404).json({ error: "Runtime nicht gefunden." });
        }

        const { error, value } = runtimeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        await runtime.update({
            duration_seconds: value.duration_seconds,
            recorded_by: req.user.id,
        });

        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Laufzeit:", err);
        next(err);
    }
};



// ============================================================
// ❌ Laufzeit löschen
// ============================================================
exports.deleteRuntime = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) {
            return res.status(404).json({ error: "Runtime nicht gefunden." });
        }

        await runtime.destroy();
        res.json({ message: "Runtime erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Laufzeit:", err);
        next(err);
    }
};
