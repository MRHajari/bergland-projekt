// backend/controllers/bookingController.js
const { Booking, EventRegistration, Accommodation, Occupancy } = require("../models");
const { bookingSchema, bookingUpdateSchema } = require("../validators/bookingValidator");



// ============================================================
// ➕ Neue Buchung erstellen (mehrere Unterkünfte pro Registrierung erlaubt)
// ============================================================
exports.createBooking = async (req, res, next) => {
    const t = await Booking.sequelize.transaction();
    try {
        const { error } = bookingSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const {
            event_registration_id,
            accommodation_id,
            single_beds,
            double_beds,
            multi_beds,
        } = req.body;

        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: "Nicht autorisiert." });

        if (!event_registration_id || !accommodation_id) {
            return res.status(400).json({
                error:
                    "❌ event_registration_id und accommodation_id sind erforderlich.",
            });
        }

        // 🔍 Registrierung prüfen
        const registration = await EventRegistration.findByPk(event_registration_id);
        if (!registration) {
            return res
                .status(404)
                .json({ error: "❌ Die angegebene EventRegistration existiert nicht." });
        }

        const eventId = registration.event_id;

        // 🏨 Unterkunft prüfen
        const accommodation = await Accommodation.findByPk(accommodation_id);
        if (!accommodation)
            return res.status(404).json({ error: "Unterkunft nicht gefunden." });

        // ⚠️ Doppelte Buchung für dieselbe Unterkunft vermeiden
        const existing = await Booking.findOne({
            where: { event_registration_id, accommodation_id },
        });
        if (existing) {
            return res.status(409).json({
                error:
                    "⚠️ Es existiert bereits eine Buchung für diese Unterkunft in dieser Anmeldung.",
            });
        }

        // 🔎 Occupancy für Event + Unterkunft finden
        const occupancy = await Occupancy.findOne({
            where: { event_id: eventId, accommodation_id },
        });
        if (!occupancy) {
            return res
                .status(404)
                .json({ error: "Keine Belegungsdaten für diese Unterkunft gefunden." });
        }

        // 🧮 Verfügbarkeit prüfen
        if (
            single_beds >
            occupancy.single_beds_total - occupancy.single_beds_booked ||
            double_beds >
            occupancy.double_beds_total - occupancy.double_beds_booked ||
            multi_beds >
            occupancy.multi_beds_total - occupancy.multi_beds_booked
        ) {
            return res
                .status(400)
                .json({ error: "❌ Nicht genügend freie Betten verfügbar." });
        }

        // 💾 Buchung anlegen
        const booking = await Booking.create(
            {
                event_registration_id,
                event_id: eventId,
                accommodation_id,
                user_id: userId,
                single_beds,
                double_beds,
                multi_beds,
            },
            { transaction: t }
        );

        // 📊 Occupancy aktualisieren
        await occupancy.update(
            {
                single_beds_booked: occupancy.single_beds_booked + single_beds,
                double_beds_booked: occupancy.double_beds_booked + double_beds,
                multi_beds_booked: occupancy.multi_beds_booked + multi_beds,
            },
            { transaction: t }
        );

        await t.commit();
        res.status(201).json(booking);
    } catch (err) {
        await t.rollback();
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
                {
                    model: EventRegistration,
                    as: "eventRegistration",
                    attributes: ["id", "event_id", "registered_by_person_id"],
                },
                { model: Accommodation, as: "accommodation", attributes: ["id", "name", "city"] },
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
                {
                    model: EventRegistration,
                    as: "eventRegistration",
                    attributes: ["id", "event_id", "registered_by_person_id"],
                },
                { model: Accommodation, as: "accommodation", attributes: ["id", "name", "city"] },
            ],
        });

        if (!booking) return res.status(404).json({ error: "❌ Buchung nicht gefunden." });

        res.json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Buchung:", err);
        next(err);
    }
};

// ============================================================
// ✏️ Buchung aktualisieren (inkl. Occupancy-Anpassung)
// ============================================================
exports.updateBooking = async (req, res, next) => {
    const t = await Booking.sequelize.transaction();
    try {
        const { bookingUpdateSchema } = require("../validators/bookingValidator");
        const { error } = bookingUpdateSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ error: error.details.map(d => d.message).join(", ") });
        }

        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ error: "❌ Buchung nicht gefunden." });

        const occupancy = await Occupancy.findOne({
            where: { event_id: booking.event_id, accommodation_id: booking.accommodation_id },
        });

        if (!occupancy) return res.status(404).json({ error: "Belegungsdaten nicht gefunden." });

        // 🧮 Alte Werte abziehen
        await occupancy.update(
            {
                single_beds_booked: occupancy.single_beds_booked - booking.single_beds,
                double_beds_booked: occupancy.double_beds_booked - booking.double_beds,
                multi_beds_booked: occupancy.multi_beds_booked - booking.multi_beds,
            },
            { transaction: t }
        );

        // 💾 Buchung mit neuen Werten speichern
        await booking.update(req.body, { transaction: t });

        // 🧮 Neue Werte hinzufügen
        await occupancy.update(
            {
                single_beds_booked: occupancy.single_beds_booked + (req.body.single_beds ?? booking.single_beds),
                double_beds_booked: occupancy.double_beds_booked + (req.body.double_beds ?? booking.double_beds),
                multi_beds_booked: occupancy.multi_beds_booked + (req.body.multi_beds ?? booking.multi_beds),
            },
            { transaction: t }
        );

        await t.commit();
        res.json(booking);
    } catch (err) {
        await t.rollback();
        console.error("❌ Fehler beim Aktualisieren der Buchung:", err);
        next(err);
    }
};


// ============================================================
// ❌ Buchung löschen (Occupancy zurücksetzen)
// ============================================================
exports.deleteBooking = async (req, res, next) => {
    const t = await Booking.sequelize.transaction();
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ error: "❌ Buchung nicht gefunden." });

        const occupancy = await Occupancy.findOne({
            where: { event_id: booking.event_id, accommodation_id: booking.accommodation_id },
        });

        if (occupancy) {
            await occupancy.update(
                {
                    single_beds_booked: occupancy.single_beds_booked - booking.single_beds,
                    double_beds_booked: occupancy.double_beds_booked - booking.double_beds,
                    multi_beds_booked: occupancy.multi_beds_booked - booking.multi_beds,
                },
                { transaction: t }
            );
        }

        await booking.destroy({ transaction: t });
        await t.commit();

        res.json({ message: "✅ Buchung erfolgreich gelöscht." });
    } catch (err) {
        await t.rollback();
        console.error("❌ Fehler beim Löschen der Buchung:", err);
        next(err);
    }
};

// ============================================================
// 📋 Buchung zu einer EventRegistration abrufen
// ============================================================
exports.getByEventRegistration = async (req, res) => {
    const { registrationId } = req.params;

    try {
        const booking = await Booking.findOne({
            where: { event_registration_id: registrationId },
            include: [
                { model: Accommodation, as: "accommodation", attributes: ["id", "name", "city"] },
            ],
        });

        if (!booking) {
            return res.status(404).json({ error: "Keine Buchung für diese Registrierung gefunden." });
        }

        res.json(booking);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchung für Registrierung:", err);
        res.status(500).json({ error: "Fehler beim Laden der Buchung." });
    }
};

// ============================================================
// 📋 Alle Buchungen für eine Registrierung (mehrere Unterkünfte)
// ============================================================
exports.getAllByRegistration = async (req, res, next) => {
    try {
        const { registrationId } = req.params;

        if (!registrationId) {
            return res.status(400).json({ error: "registrationId ist erforderlich." });
        }

        const bookings = await Booking.findAll({
            where: { event_registration_id: registrationId },
            include: [
                {
                    model: Accommodation,
                    as: "accommodation",
                    attributes: [
                        "id",
                        "name",
                        "street",
                        "postal_code",
                        "city",
                        "country",
                    ],
                },
            ],
            order: [["createdAt", "ASC"]],
        });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "Keine Buchungen gefunden." });
        }

        res.json(bookings);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchungen für Registrierung:", err);
        next(err);
    }
};


