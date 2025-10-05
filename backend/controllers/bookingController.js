const { Booking } = require("../models");
const bookingSchema = require("../validators/bookingValidator");

// Create new booking
exports.createBooking = async (req, res, next) => {
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const booking = await Booking.create(req.body);
        res.json(booking);
    } catch (err) {
        next(err);
    }
};

// Get all bookings
exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll();
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        res.json(booking);
    } catch (err) {
        next(err);
    }
};

// Update booking
exports.updateBooking = async (req, res, next) => {
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        await booking.update(req.body);
        res.json(booking);
    } catch (err) {
        next(err);
    }
};

// Delete booking
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        await booking.destroy();
        res.json({ message: "Booking deleted" });
    } catch (err) {
        next(err);
    }
};
