const { RelayTeam } = require("../models");
const relayTeamSchema = require("../validators/relayTeamValidator");

// Create new relay team
exports.createRelayTeam = async (req, res, next) => {
    try {
        const { error } = relayTeamSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const relayTeam = await RelayTeam.create(req.body);
        res.json(relayTeam);
    } catch (err) {
        next(err);
    }
};

// Get all relay teams
exports.getAllRelayTeams = async (req, res, next) => {
    try {
        const relayTeams = await RelayTeam.findAll();
        res.json(relayTeams);
    } catch (err) {
        next(err);
    }
};

// Get relay team by ID
exports.getRelayTeamById = async (req, res, next) => {
    try {
        const relayTeam = await RelayTeam.findByPk(req.params.id);
        if (!relayTeam) return res.status(404).json({ error: "Relay team not found" });
        res.json(relayTeam);
    } catch (err) {
        next(err);
    }
};

// Update relay team
exports.updateRelayTeam = async (req, res, next) => {
    try {
        const { error } = relayTeamSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const relayTeam = await RelayTeam.findByPk(req.params.id);
        if (!relayTeam) return res.status(404).json({ error: "Relay team not found" });

        await relayTeam.update(req.body);
        res.json(relayTeam);
    } catch (err) {
        next(err);
    }
};

// Delete relay team
exports.deleteRelayTeam = async (req, res, next) => {
    try {
        const relayTeam = await RelayTeam.findByPk(req.params.id);
        if (!relayTeam) return res.status(404).json({ error: "Relay team not found" });

        await relayTeam.destroy();
        res.json({ message: "Relay team deleted" });
    } catch (err) {
        next(err);
    }
};
