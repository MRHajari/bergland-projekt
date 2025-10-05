const { Runtime } = require("../models");
const runtimeSchema = require("../validators/runtimeValidator");

// Create new runtime
exports.createRuntime = async (req, res, next) => {
    try {
        const { error } = runtimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const runtime = await Runtime.create(req.body);
        res.json(runtime);
    } catch (err) {
        next(err);
    }
};

// Get all runtimes
exports.getAllRuntimes = async (req, res, next) => {
    try {
        const runtimes = await Runtime.findAll();
        res.json(runtimes);
    } catch (err) {
        next(err);
    }
};

// Get runtime by ID
exports.getRuntimeById = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });
        res.json(runtime);
    } catch (err) {
        next(err);
    }
};

// Update runtime
exports.updateRuntime = async (req, res, next) => {
    try {
        const { error } = runtimeSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });

        await runtime.update(req.body);
        res.json(runtime);
    } catch (err) {
        next(err);
    }
};

// Delete runtime
exports.deleteRuntime = async (req, res, next) => {
    try {
        const runtime = await Runtime.findByPk(req.params.id);
        if (!runtime) return res.status(404).json({ error: "Runtime not found" });

        await runtime.destroy();
        res.json({ message: "Runtime deleted" });
    } catch (err) {
        next(err);
    }
};
