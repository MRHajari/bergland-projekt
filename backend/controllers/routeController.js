const { Route } = require("../models");
const routeSchema = require("../validators/routeValidator");

// Create new route
exports.createRoute = async (req, res, next) => {
    try {
        const { error } = routeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const route = await Route.create(req.body);
        res.json(route);
    } catch (err) {
        next(err);
    }
};

// Get all routes
exports.getAllRoutes = async (req, res, next) => {
    try {
        const routes = await Route.findAll();
        res.json(routes);
    } catch (err) {
        next(err);
    }
};

// Get route by ID
exports.getRouteById = async (req, res, next) => {
    try {
        const route = await Route.findByPk(req.params.id);
        if (!route) return res.status(404).json({ error: "Route not found" });
        res.json(route);
    } catch (err) {
        next(err);
    }
};

// Update route
exports.updateRoute = async (req, res, next) => {
    try {
        const { error } = routeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const route = await Route.findByPk(req.params.id);
        if (!route) return res.status(404).json({ error: "Route not found" });

        await route.update(req.body);
        res.json(route);
    } catch (err) {
        next(err);
    }
};

// Delete route
exports.deleteRoute = async (req, res, next) => {
    try {
        const route = await Route.findByPk(req.params.id);
        if (!route) return res.status(404).json({ error: "Route not found" });

        await route.destroy();
        res.json({ message: "Route deleted" });
    } catch (err) {
        next(err);
    }
};
