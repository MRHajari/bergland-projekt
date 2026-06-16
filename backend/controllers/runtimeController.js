const {
    Runtime,
    EventRegistration,
    EventRegistrationParticipant,
    EventRoute,
    User,
    Event,
    Route
} = require("../models");

const {
    createRuntimeSchema,
    updateRuntimeSchema,
} = require("../validators/runtimeValidator");

const runtimeInclude = [
    {
        model: EventRegistrationParticipant,
        as: "participant",
        include: [
            {
                model: EventRegistration,
                as: "registration",
                attributes: ["id", "event_id"],
            },
        ],
    },
    {
        model: EventRoute,
        as: "eventRoute",
        include: [
            { model: Event, as: "event" },
            { model: Route, as: "route" },
        ],
    },
    { model: User, as: "timekeeper", attributes: ["id", "email"] },
];

function normalizeOptionalTime(value) {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;

    const trimmed = String(value).trim();
    if (!trimmed) return null;

    if (/^\d{2}:\d{2}$/.test(trimmed)) {
        return `${trimmed}:00`;
    }

    return trimmed;
}

function timeToSeconds(value) {
    if (!value) return null;

    const [hours, minutes, seconds] = value.split(":").map(Number);
    return (hours * 3600) + (minutes * 60) + seconds;
}

function calculateDurationSeconds(startTime, finishTime) {
    if (!startTime || !finishTime) return 0;

    const startSeconds = timeToSeconds(startTime);
    const finishSeconds = timeToSeconds(finishTime);

    if (startSeconds === null || finishSeconds === null) return 0;
    return finishSeconds - startSeconds;
}

function validateChronology({ start_time, finish_time, split_time }) {
    if (finish_time && !start_time) {
        return "Eine Zielzeit darf nur mit vorhandener Startzeit gespeichert werden.";
    }

    if (split_time && !start_time) {
        return "Eine Zwischenzeit darf nur mit vorhandener Startzeit gespeichert werden.";
    }

    const startSeconds = timeToSeconds(start_time);
    const finishSeconds = timeToSeconds(finish_time);
    const splitSeconds = timeToSeconds(split_time);

    if (startSeconds !== null && splitSeconds !== null && splitSeconds < startSeconds) {
        return "Die Zwischenzeit darf nicht vor der Startzeit liegen.";
    }

    if (startSeconds !== null && finishSeconds !== null && finishSeconds < startSeconds) {
        return "Die Zielzeit darf nicht vor der Startzeit liegen.";
    }

    if (splitSeconds !== null && finishSeconds !== null && finishSeconds < splitSeconds) {
        return "Die Zielzeit darf nicht vor der Zwischenzeit liegen.";
    }

    return null;
}

async function loadParticipant(participantId) {
    return EventRegistrationParticipant.findByPk(participantId, {
        include: [
            {
                model: EventRegistration,
                as: "registration",
                attributes: ["id", "event_id"],
            },
        ],
    });
}

async function resolveEventRoute({ participant, route_id, event_route_id }) {
    if (event_route_id) {
        const directEventRoute = await EventRoute.findByPk(event_route_id);

        if (
            directEventRoute &&
            directEventRoute.event_id === participant.registration.event_id
        ) {
            return directEventRoute;
        }
    }

    if (!route_id && !event_route_id) {
        return null;
    }

    return EventRoute.findOne({
        where: {
            event_id: participant.registration.event_id,
            route_id: route_id || event_route_id,
        },
    });
}


// ============================================================
// ➕ Neue Laufzeit
// ============================================================
exports.createRuntime = async (req, res, next) => {
    try {
        const { error, value } = createRuntimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const participant = await loadParticipant(value.participant_id);

        if (!participant) {
            return res.status(404).json({ error: "Teilnehmer nicht gefunden." });
        }

        if (!participant.registration) {
            return res.status(404).json({ error: "Registrierung des Teilnehmers nicht gefunden." });
        }

        const eventRoute = await resolveEventRoute({
            participant,
            route_id: value.route_id,
            event_route_id: value.event_route_id,
        });

        console.log("CREATE runtime payload:", {
            participant_id: value.participant_id,
            registration_id: value.registration_id,
            route_id: value.route_id,
            event_route_id: value.event_route_id,
            start_time: value.start_time,
            finish_time: value.finish_time,
            split_time: value.split_time,
            user: req.user?.id,
        });

        if (!eventRoute) {
            return res
                .status(404)
                .json({ error: "EventRoute nicht gefunden (Event+Route passt nicht)." });
        }

        const start_time = normalizeOptionalTime(value.start_time);
        const finish_time = normalizeOptionalTime(value.finish_time);
        const split_time = normalizeOptionalTime(value.split_time);

        const chronologyError = validateChronology({
            start_time,
            finish_time,
            split_time,
        });

        if (chronologyError) {
            return res.status(400).json({ error: chronologyError });
        }

        console.log("FOUND eventRoute:", eventRoute ? {
            id: eventRoute.id,
            event_id: eventRoute.event_id,
            route_id: eventRoute.route_id,
        } : null);

        const exists = await Runtime.findOne({
            where: {
                participant_id: value.participant_id,
                event_route_id: eventRoute.id,
            },
        });

        if (exists) {
            return res.status(400).json({
                error: "Für diese Strecke existiert bereits eine Laufzeit.",
            });
        }

        const runtime = await Runtime.create({
            participant_id: value.participant_id,
            registration_id: value.registration_id || participant.registration.id,
            route_id: eventRoute.route_id,
            event_route_id: eventRoute.id,
            start_time,
            finish_time,
            split_time,
            duration_seconds: calculateDurationSeconds(start_time, finish_time),
            recorded_by: req.user.id,
        });

        const created = await Runtime.findByPk(runtime.id, { include: runtimeInclude });

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
            include: runtimeInclude,
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
            include: runtimeInclude,
        });

        if (!runtime) return res.status(404).json({ error: "Runtime nicht gefunden." });

        res.json(runtime);
    } catch (err) {
        console.error("❌ Fehler getRuntimeById:", err);
        next(err);
    }
};

// ============================================================
// 🔍 Laufzeiten eines Teilnehmers
// ============================================================
exports.getByParticipant = async (req, res, next) => {
    try {
        const runtimes = await Runtime.findAll({
            where: { participant_id: req.params.participantId },
            include: runtimeInclude,
        });

        res.json(runtimes);
    } catch (err) {
        console.error("❌ Fehler getByParticipant:", err);
        next(err);
    }
};

// ============================================================
// 🔍 Laufzeiten eines Events
// ============================================================
exports.getByEvent = async (req, res, next) => {
    try {
        const runtimes = await Runtime.findAll({
            include: [
                {
                    model: EventRegistrationParticipant,
                    as: "participant",
                    required: true,
                    include: [
                        {
                            model: EventRegistration,
                            as: "registration",
                            required: true,
                            where: { event_id: req.params.eventId },
                            attributes: ["id", "event_id"],
                        },
                    ],
                },
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
        console.error("❌ Fehler getByEvent:", err);
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

        const nextValues = {
            start_time:
                value.start_time !== undefined
                    ? normalizeOptionalTime(value.start_time)
                    : runtime.start_time,
            finish_time:
                value.finish_time !== undefined
                    ? normalizeOptionalTime(value.finish_time)
                    : runtime.finish_time,
            split_time:
                value.split_time !== undefined
                    ? normalizeOptionalTime(value.split_time)
                    : runtime.split_time,
        };

        const chronologyError = validateChronology(nextValues);
        if (chronologyError) {
            return res.status(400).json({ error: chronologyError });
        }

        await runtime.update({
            start_time: nextValues.start_time,
            finish_time: nextValues.finish_time,
            split_time: nextValues.split_time,
            duration_seconds: calculateDurationSeconds(nextValues.start_time, nextValues.finish_time),
            recorded_by: req.user.id,
        });

        const updated = await Runtime.findByPk(runtime.id, { include: runtimeInclude });

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