const {
    Runtime,
    EventRegistration,
    EventRoute,
    User,
    Event,
    Route
} = require("../models");

const {
    createRuntimeSchema,
    updateRuntimeSchema,
} = require("../validators/runtimeValidator");


// ============================================================
// ➕ Neue Laufzeit
// ============================================================
exports.createRuntime = async (req, res, next) => {
    try {
        const { error, value } = createRuntimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { event_registration_id, event_route_id, duration_seconds } = value;

        console.log("CREATE runtime payload:", {
            event_registration_id,
            event_route_id,
            duration_seconds,
            user: req.user?.id,
        });

        // Registrierung prüfen
        const registration = await EventRegistration.findByPk(event_registration_id);
        if (!registration) {
            return res.status(404).json({ error: "Registration nicht gefunden." });
        }

        /**
         * WICHTIG:
         * Frontend schickt aktuell Route.id als event_route_id.
         * Daher NICHT findByPk(event_route_id), sondern EventRoute über (event_id + route_id) suchen.
         */
        const eventRoute = await EventRoute.findOne({
            where: {
                event_id: registration.event_id,
                route_id: event_route_id, // <- hier steckt Route.id drin
            },
        });

        console.log("FOUND eventRoute:", eventRoute ? {
            id: eventRoute.id,
            event_id: eventRoute.event_id,
            route_id: eventRoute.route_id,
        } : null);

        if (!eventRoute) {
            return res
                .status(404)
                .json({ error: "EventRoute nicht gefunden (Event+Route passt nicht)." });
        }

        // prüfen ob runtime für diese kombination existiert
        const exists = await Runtime.findOne({
            where: {
                event_registration_id,
                event_route_id: eventRoute.id, // <- speichern immer gegen EventRoute.id
            },
        });

        if (exists) {
            return res.status(400).json({
                error: "Für diese Strecke existiert bereits eine Laufzeit.",
            });
        }

        const runtime = await Runtime.create({
            event_registration_id,
            event_route_id: eventRoute.id, // <- EventRoute.id in DB speichern
            duration_seconds,
            recorded_by: req.user.id,
        });

        const created = await Runtime.findByPk(runtime.id, {
            include: [
                {
                    model: EventRoute,
                    as: "eventRoute",
                },
            ],
        });

        return res.status(201).json(created);
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
                        { model: Route, as: "route" },
                    ],
                },
                { model: User, as: "timekeeper", attributes: ["id", "email"] },
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

        if (!runtime) return res.status(404).json({ error: "Runtime nicht gefunden." });

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
                { model: User, as: "timekeeper" },
            ],
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
        if (!runtime) return res.status(404).json({ error: "Runtime nicht gefunden." });

        const { error, value } = updateRuntimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        await runtime.update({
            duration_seconds: value.duration_seconds,
            recorded_by: req.user.id,
        });

        // optional: Runtime inkl. eventRoute zurückgeben, damit Frontend direkt alles hat
        const updated = await Runtime.findByPk(runtime.id, {
            include: [{ model: EventRoute, as: "eventRoute" }],
        });

        return res.json(updated);
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
        if (!runtime) return res.status(404).json({ error: "Runtime nicht gefunden." });

        await runtime.destroy();
        res.json({ message: "Runtime gelöscht." });
    } catch (err) {
        console.error("❌ Fehler deleteRuntime:", err);
        next(err);
    }
};