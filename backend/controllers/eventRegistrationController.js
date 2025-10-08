const EventRegistration = require("../models/eventRegistration");
const { eventRegistrationSchema } = require("../validators/eventRegistrationValidator");

exports.createEventRegistration = async (req, res, next) => {
    try {
        const { error } = eventRegistrationSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const registration = await EventRegistration.create(req.body);
        res.status(201).json(registration);
    } catch (err) {
        next(err);
    }
};

exports.getAllEventRegistrations = async (req, res, next) => {
    try {
        const registrations = await EventRegistration.findAll();
        res.json(registrations);
    } catch (err) {
        next(err);
    }
};

exports.getEventRegistrationById = async (req, res, next) => {
    try {
        const registration = await EventRegistration.findByPk(req.params.id);
        if (!registration) return res.status(404).json({ error: "Anmeldung nicht gefunden" });
        res.json(registration);
    } catch (err) {
        next(err);
    }
};

exports.updateEventRegistration = async (req, res, next) => {
    try {
        const { error } = eventRegistrationSchema.validate(req.body, { allowUnknown: true });
        if (error) return res.status(400).json({ error: error.details[0].message });

        const registration = await EventRegistration.findByPk(req.params.id);
        if (!registration) return res.status(404).json({ error: "Anmeldung nicht gefunden" });

        await registration.update(req.body);
        res.json(registration);
    } catch (err) {
        next(err);
    }
};

exports.deleteEventRegistration = async (req, res, next) => {
    try {
        const registration = await EventRegistration.findByPk(req.params.id);
        if (!registration) return res.status(404).json({ error: "Anmeldung nicht gefunden" });

        await registration.destroy();
        res.json({ message: "Anmeldung gelöscht" });
    } catch (err) {
        next(err);
    }
};

exports.getByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const registrations = await EventRegistration.findAll({
            where: { person_id: userId },
            include: [{ model: Event, as: "event" }]
        });
        res.json(registrations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Anmeldungen:", err);
        res.status(500).json({ message: "Fehler beim Laden der Event-Anmeldungen" });
    }
};

