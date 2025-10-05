const { Registration } = require("../models");
const registrationSchema = require("../validators/registrationValidator");

// Create new registration
exports.createRegistration = async (req, res, next) => {
    try {
        const { error } = registrationSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const registration = await Registration.create(req.body);
        res.json(registration);
    } catch (err) {
        next(err);
    }
};

// Get all registrations
exports.getAllRegistrations = async (req, res, next) => {
    try {
        const registrations = await Registration.findAll();
        res.json(registrations);
    } catch (err) {
        next(err);
    }
};

// Get registration by ID
exports.getRegistrationById = async (req, res, next) => {
    try {
        const registration = await Registration.findByPk(req.params.id);
        if (!registration) return res.status(404).json({ error: "Registration not found" });
        res.json(registration);
    } catch (err) {
        next(err);
    }
};

// Update registration
exports.updateRegistration = async (req, res, next) => {
    try {
        const { error } = registrationSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const registration = await Registration.findByPk(req.params.id);
        if (!registration) return res.status(404).json({ error: "Registration not found" });

        await registration.update(req.body);
        res.json(registration);
    } catch (err) {
        next(err);
    }
};

// Delete registration
exports.deleteRegistration = async (req, res, next) => {
    try {
        const registration = await Registration.findByPk(req.params.id);
        if (!registration) return res.status(404).json({ error: "Registration not found" });

        await registration.destroy();
        res.json({ message: "Registration deleted" });
    } catch (err) {
        next(err);
    }
};
