// backend/controllers/bookingController.js
const { Booking, Event, Accommodation, User } = require("../models");
const bookingSchema = require("../validators/bookingValidator");

// ============================================================
// ➕ Neue Buchung erstellen
// ============================================================
exports.createBooking = async (req, res, next) => {
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { user_id, event_id, accommodation_id } = req.body;

        if (!user_id || !event_id || !accommodation_id) {
            return res.status(400).json({
                error: "❌ user_id, event_id und accommodation_id sind erforderlich.",
            });
        }

        // ⚠️ Optional: prüfen, ob der User diese Unterkunft für das Event schon gebucht hat
        const existing = await Booking.findOne({
            where: { user_id, event_id, accommodation_id },
        });

        if (existing) {
            return res.status(409).json({
                error: "⚠️ Du hast diese Unterkunft für dieses Event bereits gebucht.",
            });
        }

        const booking = await Booking.create(req.body);
        res.status(201).json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Buchung:", err);
        next(err);
    }
};

// ============================================================
// 📋 Alle Buchungen (Admin oder Debug)
// ============================================================
exports.getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: Event, as: "event", attributes: ["id", "name", "start_date", "end_date"] },
                { model: Accommodation, as: "accommodation", attributes: ["id", "name", "city"] },
                { model: User, as: "user", attributes: ["id", "email"] },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(bookings);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchungen:", err);
        next(err);
    }
};

// ============================================================
// 🔍 Einzelne Buchung per ID abrufen
// ============================================================
exports.getBookingById = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id, {
            include: [
                { model: Event, as: "event", attributes: ["id", "name"] },
                { model: Accommodation, as: "accommodation", attributes: ["id", "name"] },
                { model: User, as: "user", attributes: ["id", "email"] },
            ],
        });

        if (!booking) {
            return res.status(404).json({ error: "❌ Buchung nicht gefunden." });
        }

        res.json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Buchung:", err);
        next(err);
    }
};

// ============================================================
// ✏️ Buchung aktualisieren
// ============================================================
exports.updateBooking = async (req, res, next) => {
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: "❌ Buchung nicht gefunden." });
        }

        await booking.update(req.body);
        res.json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Buchung:", err);
        next(err);
    }
};

// ============================================================
// ❌ Buchung löschen
// ============================================================
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: "❌ Buchung nicht gefunden." });
        }

        await booking.destroy();
        res.json({ message: "✅ Buchung erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Buchung:", err);
        next(err);
    }
};

// ============================================================
// 👤 Alle Buchungen eines bestimmten Users abrufen
// ============================================================
exports.getByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const bookings = await Booking.findAll({
            where: { user_id: userId },
            include: [
                { model: Event, as: "event", attributes: ["id", "name", "start_date", "end_date"] },
                { model: Accommodation, as: "accommodation", attributes: ["id", "name", "city"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(bookings);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchungen eines Users:", err);
        res.status(500).json({ error: "Fehler beim Laden der Buchungen." });
    }
};

// ============================================================
// 📅 Buchungen für ein bestimmtes Event abrufen (Admin)
// ============================================================
exports.getByEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const bookings = await Booking.findAll({
            where: { event_id: eventId },
            include: [
                { model: User, as: "user", attributes: ["id", "email"] },
                { model: Accommodation, as: "accommodation", attributes: ["id", "name", "city"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(bookings);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchungen für das Event:", err);
        res.status(500).json({ error: "Fehler beim Laden der Event-Buchungen." });
    }
};
