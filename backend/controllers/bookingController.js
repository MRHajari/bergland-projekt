// backend/controllers/bookingController.js
const { Booking, Event, Accommodation } = require("../models");
const bookingSchema = require("../validators/bookingValidator");

// ➕ Neue Buchung erstellen
exports.createBooking = async (req, res, next) => {
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const booking = await Booking.create(req.body);
        res.json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Buchung:", err);
        next(err);
    }
};

// 📋 Alle Buchungen (Admin oder Debug)
exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Event, as: "event" },
                { model: Accommodation, as: "accommodation" }
            ],
            order: [["createdAt", "DESC"]], // ✅ funktioniert, da timestamps aktiv sind
        });
        res.json(bookings);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchungen:", err);
        next(err);
    }
};

// 🔍 Buchung per ID
exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: Event, as: "event" },
                { model: Accommodation, as: "accommodation" },
            ],
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });

        res.json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Buchung:", err);
        next(err);
    }
};

// ✏️ Buchung aktualisieren
exports.updateBooking = async (req, res, next) => {
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const booking = await Booking.findByPk(req.params.id);
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });

        await booking.update(req.body);
        res.json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Buchung:", err);
        next(err);
    }
};

// ❌ Buchung löschen
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });

        await booking.destroy();
        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Buchung:", err);
        next(err);
    }
};

// 👤 Alle Buchungen eines bestimmten Users
exports.getByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const bookings = await Booking.findAll({
            where: { person_id: userId },
            include: [
                { model: Event, as: "event" },
                { model: Accommodation, as: "accommodation" },
            ],
            order: [["createdAt", "DESC"]], // ✅ funktioniert durch timestamps
        });

        res.json(bookings);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchungen:", err);
        res.status(500).json({ error: "Fehler beim Laden der Buchungen." });
    }
};
