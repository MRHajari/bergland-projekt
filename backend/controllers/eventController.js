// backend/controllers/eventController.js
const { Event } = require("../models");
const { validateEvent } = require("../validators/eventValidator");

// 🔹 Create new event
exports.createEvent = async (req, res, next) => {
    try {
        const { error } = validateEvent(req.body);
        if (error) {
            return res.status(400).json({ error: error.details.map(d => d.message) });
        }

        const event = await Event.create(req.body);
        res.json(event);
    } catch (err) {
        next(err);
    }
};

// 🔹 Get all events
exports.getAllEvents = async (req, res, next) => {
    try {
        const events = await Event.findAll();
        res.json(events);
    } catch (err) {
        next(err);
    }
};

// 🔹 Get event by ID
exports.getEventById = async (req, res, next) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.json(event);
    } catch (err) {
        next(err);
    }
};

// 🔹 Update event
exports.updateEvent = async (req, res, next) => {
    try {
        const { error } = validateEvent(req.body);
        if (error) {
            return res.status(400).json({ error: error.details.map(d => d.message) });
        }

        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });

        await event.update(req.body);
        res.json(event);
    } catch (err) {
        next(err);
    }
};

// 🔹 Delete event
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });

        await event.destroy();
        res.json({ message: "Event deleted" });
    } catch (err) {
        next(err);
    }
};
