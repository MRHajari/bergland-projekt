const { Accommodation } = require("../models");
const accommodationSchema = require("../validators/accommodationValidator");

// Create new accommodation
exports.createAccommodation = async (req, res, next) => {
    try {
        const { error } = accommodationSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const accommodation = await Accommodation.create(req.body);
        res.json(accommodation);
    } catch (err) {
        next(err);
    }
};

// Get all accommodations
exports.getAllAccommodations = async (req, res, next) => {
    try {
        const accommodations = await Accommodation.findAll();
        res.json(accommodations);
    } catch (err) {
        next(err);
    }
};

// Get accommodation by ID
exports.getAccommodationById = async (req, res, next) => {
    try {
        const accommodation = await Accommodation.findByPk(req.params.id);
        if (!accommodation) return res.status(404).json({ error: "Accommodation not found" });
        res.json(accommodation);
    } catch (err) {
        next(err);
    }
};

// Update accommodation
exports.updateAccommodation = async (req, res, next) => {
    try {
        const { error } = accommodationSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const accommodation = await Accommodation.findByPk(req.params.id);
        if (!accommodation) return res.status(404).json({ error: "Accommodation not found" });

        await accommodation.update(req.body);
        res.json(accommodation);
    } catch (err) {
        next(err);
    }
};

// Delete accommodation
exports.deleteAccommodation = async (req, res, next) => {
    try {
        const accommodation = await Accommodation.findByPk(req.params.id);
        if (!accommodation) return res.status(404).json({ error: "Accommodation not found" });

        await accommodation.destroy();
        res.json({ message: "Accommodation deleted" });
    } catch (err) {
        next(err);
    }
};
