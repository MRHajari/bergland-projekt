// controllers/eventRegistrationController.js
const { EventRegistration, Event, Person } = require("../models");
const { eventRegistrationSchema } = require("../validators/eventRegistrationValidator");

// 🔹 Neue Anmeldung
exports.createEventRegistration = async (req, res, next) => {
    try {
        const { error } = eventRegistrationSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const { person_id, event_id } = req.body;

        if (!person_id || !event_id) {
            return res
                .status(400)
                .json({ error: "person_id und event_id sind erforderlich." });
        }

        // 🔸 Prüfen, ob Person & Event existieren
        const person = await Person.findByPk(person_id);
        const event = await Event.findByPk(event_id);

        if (!person) return res.status(404).json({ error: "Benutzer nicht gefunden." });
        if (!event) return res.status(404).json({ error: "Event nicht gefunden." });

        // 🕐 NEU: Anmeldeschluss prüfen
        if (event.registration_deadline) {
            const today = new Date();
            const deadline = new Date(event.registration_deadline);
            if (today > deadline) {
                return res.status(400).json({
                    error: `❌ Der Anmeldeschluss für dieses Event war am ${deadline.toLocaleDateString("de-DE")}.`,
                });
            }
        }

        // 🔹 Anmeldung erstellen
        const registration = await EventRegistration.create(req.body);

        res.status(201).json({
            message: "✅ Anmeldung erfolgreich erstellt.",
            registration,
        });
    } catch (err) {
        console.error("❌ Fehler bei der Event-Anmeldung:", err);
        next(err);
    }
};

// 🔹 Alle Anmeldungen abrufen
exports.getAllEventRegistrations = async (req, res, next) => {
    try {
        const registrations = await EventRegistration.findAll({
            include: [{ model: Event, as: "event" }],
            order: [["createdAt", "DESC"]],
        });
        res.json(registrations);
    } catch (err) {
        next(err);
    }
};

// 🔹 Einzelne Anmeldung abrufen
exports.getEventRegistrationById = async (req, res, next) => {
    try {
        const registration = await EventRegistration.findByPk(req.params.id, {
            include: [{ model: Event, as: "event" }],
        });
        if (!registration)
            return res.status(404).json({ error: "Anmeldung nicht gefunden" });
        res.json(registration);
    } catch (err) {
        next(err);
    }
};

// 🔹 Anmeldung aktualisieren
exports.updateEventRegistration = async (req, res, next) => {
    try {
        const { error } = eventRegistrationSchema.validate(req.body, {
            allowUnknown: true,
        });
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const registration = await EventRegistration.findByPk(req.params.id);
        if (!registration)
            return res.status(404).json({ error: "Anmeldung nicht gefunden" });

        await registration.update(req.body);
        res.json(registration);
    } catch (err) {
        next(err);
    }
};

// 🔹 Anmeldung löschen
exports.deleteEventRegistration = async (req, res, next) => {
    try {
        const registration = await EventRegistration.findByPk(req.params.id);
        if (!registration)
            return res.status(404).json({ error: "Anmeldung nicht gefunden" });

        await registration.destroy();
        res.json({ message: "🗑️ Anmeldung gelöscht" });
    } catch (err) {
        next(err);
    }
};

// 🔹 Alle Anmeldungen einer Person abrufen
exports.getByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const registrations = await EventRegistration.findAll({
            where: { person_id: userId },
            include: [{ model: Event, as: "event" }],
            order: [["createdAt", "DESC"]],
        });

        res.json(registrations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Anmeldungen:", err);
        res
            .status(500)
            .json({ message: "Fehler beim Laden der Event-Anmeldungen" });
    }
};
