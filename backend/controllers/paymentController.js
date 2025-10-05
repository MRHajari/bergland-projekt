const { Payment } = require("../models");
const paymentSchema = require("../validators/paymentValidator");

// Create new payment
exports.createPayment = async (req, res, next) => {
    try {
        const { error } = paymentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const payment = await Payment.create(req.body);
        res.json(payment);
    } catch (err) {
        next(err);
    }
};

// Get all payments
exports.getAllPayments = async (req, res, next) => {
    try {
        const payments = await Payment.findAll();
        res.json(payments);
    } catch (err) {
        next(err);
    }
};

// Get payment by ID
exports.getPaymentById = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ error: "Payment not found" });
        res.json(payment);
    } catch (err) {
        next(err);
    }
};

// Update payment
exports.updatePayment = async (req, res, next) => {
    try {
        const { error } = paymentSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ error: "Payment not found" });

        await payment.update(req.body);
        res.json(payment);
    } catch (err) {
        next(err);
    }
};

// Delete payment
exports.deletePayment = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ error: "Payment not found" });

        await payment.destroy();
        res.json({ message: "Payment deleted" });
    } catch (err) {
        next(err);
    }
};
