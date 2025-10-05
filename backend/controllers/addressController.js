const { Address } = require("../models");
const addressSchema = require("../validators/addressValidator");

// Create new address
exports.createAddress = async (req, res, next) => {
    try {
        const { error } = addressSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const address = await Address.create(req.body);
        res.json(address);
    } catch (err) {
        next(err);
    }
};

// Get all addresses
exports.getAllAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.findAll();
        res.json(addresses);
    } catch (err) {
        next(err);
    }
};

// Get one address
exports.getAddressById = async (req, res, next) => {
    try {
        const address = await Address.findByPk(req.params.id);
        if (!address) return res.status(404).json({ error: "Address not found" });
        res.json(address);
    } catch (err) {
        next(err);
    }
};

// Update address
exports.updateAddress = async (req, res, next) => {
    try {
        const { error } = addressSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const address = await Address.findByPk(req.params.id);
        if (!address) return res.status(404).json({ error: "Address not found" });

        await address.update(req.body);
        res.json(address);
    } catch (err) {
        next(err);
    }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
    try {
        const address = await Address.findByPk(req.params.id);
        if (!address) return res.status(404).json({ error: "Address not found" });

        await address.destroy();
        res.json({ message: "Address deleted" });
    } catch (err) {
        next(err);
    }
};
