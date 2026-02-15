// backend/controllers/eventRouteController.js
const { EventRoute, Event, Route } = require("../models");
const schema = require("../validators/eventRouteValidator");

// ➕ Zuordnung Event ↔ Route (Lauftag) erstellen
exports.createEventRoute = async (req, res, next) => {
    try {
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const event = await Event.findByPk(value.event_id);
        if (!event) return res.status(404).json({ error: "Event nicht gefunden." });

        const route = await Route.findByPk(value.route_id);
        if (!route) return res.status(404).json({ error: "Route nicht gefunden." });

        const created = await EventRoute.create(value);
        res.status(201).json(created);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen EventRoute:", err);
        next(err);
    }
};

// 📋 Alle Lauftage (Admin)
exports.getAllEventRoutes = async (req, res, next) => {
    try {
        const items = await EventRoute.findAll({
            include: [
                { model: Event, as: "event" },
                { model: Route, as: "route" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(items);
    } catch (err) {
        console.error("❌ Fehler beim Laden EventRoutes:", err);
        next(err);
    }
};

// 📋 Lauftage eines Events
exports.getEventRoutesByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        const items = await EventRoute.findAll({
            where: { event_id: eventId },
            include: [{ model: Route, as: "route" }],
            order: [["createdAt", "DESC"]],
        });

        res.json(items);
    } catch (err) {
        console.error("❌ Fehler beim Laden EventRoutes für Event:", err);
        next(err);
    }
};

// ❌ Löschen einer Zuordnung
exports.deleteEventRoute = async (req, res, next) => {
    try {
        const item = await EventRoute.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: "EventRoute nicht gefunden." });

        await item.destroy();
        res.json({ message: "Zuordnung gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen EventRoute:", err);
        next(err);
    }
};
