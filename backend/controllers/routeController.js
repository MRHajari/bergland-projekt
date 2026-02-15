const { Route } = require("../models");
const routeSchema = require("../validators/routeValidator");

// ➕ Neue Strecke erstellen
exports.createRoute = async (req, res, next) => {
    try {
        const { error, value } = routeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const route = await Route.create(value);
        res.status(201).json(route);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Strecke:", err);
        next(err);
    }
};

// 📋 Alle Strecken (global)
exports.getAllRoutes = async (req, res, next) => {
    try {
        const routes = await Route.findAll({
            order: [["createdAt", "DESC"]],
        });
        res.json(routes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Strecken:", err);
        next(err);
    }
};

// 🔎 Strecke per ID
exports.getRouteById = async (req, res, next) => {
    try {
        const route = await Route.findByPk(req.params.id);
        if (!route) return res.status(404).json({ error: "Route nicht gefunden." });

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
        if (error) return res.status(400).json({ error: error.details[0].message });

        const route = await Route.findByPk(req.params.id);
        if (!route) return res.status(404).json({ error: "Route nicht gefunden." });

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
        if (!route) return res.status(404).json({ error: "Route nicht gefunden." });

        await route.destroy();
        res.json({ message: "Route erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Strecke:", err);
        next(err);
    }
};

// 📋 Strecken eines bestimmten Events
exports.getRoutesByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        const routes = await Route.findAll({
            include: [
                {
                    association: "events",
                    where: { id: eventId },
                    through: { attributes: [] }
                }
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(routes);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Event-Strecken:", err);
        next(err);
    }
};

