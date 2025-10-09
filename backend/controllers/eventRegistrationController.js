// backend/controllers/eventRegistrationController.js
const { EventRegistration, Event, Person, RelayTeam, Squadron, Runtime } = require("../models");
const eventRegistrationSchema = require("../validators/eventRegistrationValidator");

// ➕ Neue Anmeldung erstellen
exports.createRegistration = async (req, res, next) => {
    try {
        const { error } = eventRegistrationSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const registration = await EventRegistration.create(req.body);
        res.json(registration);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Anmeldung:", err);
        next(err);
    }
};

// 📋 Alle Anmeldungen (Admin)
exports.getAllRegistrations = async (req, res, next) => {
    try {
        const registrations = await EventRegistration.findAll({
            include: [
                { model: Person, as: "person" },
                { model: Event, as: "event" },
                { model: RelayTeam, as: "relayTeam" },
                { model: Squadron, as: "squadron" },
                { model: Runtime, as: "runtimes" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(registrations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Anmeldungen:", err);
        next(err);
    }
};

// 🔍 Anmeldung per ID
exports.getRegistrationById = async (req, res, next) => {
    try {
        const registration = await EventRegistration.findByPk(req.params.id, {
            include: [
                { model: Person, as: "person" },
                { model: Event, as: "event" },
                { model: RelayTeam, as: "relayTeam" },
                { model: Squadron, as: "squadron" },
                { model: Runtime, as: "runtimes" },
            ],
        });

        if (!registration)
            return res.status(404).json({ error: "Registration not found" });

        res.json(registration);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Anmeldung:", err);
        next(err);
    }
};

// 🔍 Anmeldungen eines bestimmten Events
exports.getByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const registrations = await EventRegistration.findAll({
            where: { event_id: eventId },
            include: [{ model: Person, as: "person" }, { model: Squadron, as: "squadron" }],
            order: [["createdAt", "DESC"]],
        });
        res.json(registrations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Anmeldungen für Event:", err);
        next(err);
    }
};

// 🔍 Anmeldungen einer bestimmten Person
exports.getByPerson = async (req, res, next) => {
    try {
        const { personId } = req.params;
        const registrations = await EventRegistration.findAll({
            where: { person_id: personId },
            include: [{ model: Event, as: "event" }],
            order: [["createdAt", "DESC"]],
        });
        res.json(registrations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Anmeldungen der Person:", err);
        next(err);
    }
};

// ✏️ Anmeldung aktualisieren
exports.updateRegistration = async (req, res, next) => {
    try {
        const { error } = eventRegistrationSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const registration = await EventRegistration.findByPk(req.params.id);
        if (!registration)
            return res.status(404).json({ error: "Registration not found" });

        await registration.update(req.body);
        res.json(registration);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Anmeldung:", err);
        next(err);
    }
};

// ❌ Anmeldung löschen
exports.deleteRegistration = async (req, res, next) => {
    try {
        const registration = await EventRegistration.findByPk(req.params.id);
        if (!registration)
            return res.status(404).json({ error: "Registration not found" });

        await registration.destroy();
        res.json({ message: "Registration deleted successfully" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Anmeldung:", err);
        next(err);
    }
};
