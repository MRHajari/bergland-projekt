const { Route, Event } = require("../models");
const routeSchema = require("../validators/routeValidator");

// ➕ Neue Strecke erstellen
exports.createRoute = async (req, res, next) => {
    try {
        const { error, value } = routeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // 🔍 Prüfen ob Event existiert
        const event = await Event.findByPk(value.event_id);
        if (!event) {
            return res.status(404).json({ error: "Event nicht gefunden." });
        }

        const route = await Route.create(value);
        res.status(201).json(route);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Strecke:", err);
        next(err);
    }
};

// 📋 Alle Strecken
exports.getAllRoutes = async (req, res, next) => {
    try {
        const routes = await Route.findAll({
            include: [{ model: Event, as: "event" }],
            order: [["createdAt", "DESC"]],
        });

        res.json(routes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Strecken:", err);
        next(err);
    }
};

// 🔍 Strecken nach Event
exports.getRoutesByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        const routes = await Route.findAll({
            where: { event_id: eventId },
            include: [{ model: Event, as: "event" }],
            order: [["createdAt", "DESC"]],
        });

        res.json(routes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Strecken für Event:", err);
        next(err);
    }
};

// 🔎 Strecke per ID
exports.getRouteById = async (req, res, next) => {
    try {
        const route = await Route.findByPk(req.params.id, {
            include: [{ model: Event, as: "event" }],
        });

        if (!route) {
            return res.status(404).json({ error: "Route nicht gefunden." });
        }

        res.json(route);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Strecke:", err);
        next(err);
    }
};

// ✏️ Strecke aktualisieren
exports.updateRoute = async (req, res, next) => {
    try {
        const { error, value } = routeSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const route = await Route.findByPk(req.params.id);
        if (!route) {
            return res.status(404).json({ error: "Route nicht gefunden." });
        }

        // 🔒 Event-Zuordnung darf NICHT geändert werden
        if (value.event_id && value.event_id !== route.event_id) {
            return res.status(400).json({
                error: "Event-Zuordnung einer Strecke darf nicht geändert werden.",
            });
        }

        await route.update(value);
        res.json(route);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Strecke:", err);
        next(err);
    }
};

// 🗑️ Strecke löschen
exports.deleteRoute = async (req, res, next) => {
    try {
        const route = await Route.findByPk(req.params.id);
        if (!route) {
            return res.status(404).json({ error: "Route nicht gefunden." });
        }

        await route.destroy();
        res.json({ message: "Route erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Strecke:", err);
        next(err);
    }
};
