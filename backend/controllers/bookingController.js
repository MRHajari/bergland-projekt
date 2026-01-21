// backend/controllers/bookingController.js
const { Booking, EventRegistration, Accommodation, Occupancy } = require("../models");
const { bookingSchema, bookingUpdateSchema } = require("../validators/bookingValidator");



// ============================================================
// ➕ Neue Buchung erstellen
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
            single_beds = 0,
            double_beds = 0,
            quad_beds = 0,
            quint_beds = 0,
            sext_beds = 0,
        } = req.body;

        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Nicht autorisiert." });

        const registration = await EventRegistration.findByPk(event_registration_id);
        if (!registration) {
            return res.status(404).json({ error: "EventRegistration nicht gefunden." });
        }

        const occupancy = await Occupancy.findOne({
            where: { event_id: registration.event_id, accommodation_id },
            lock: t.LOCK.UPDATE,
            transaction: t,
        });

        if (!occupancy) {
            return res.status(404).json({ error: "Keine Belegungsdaten gefunden." });
        }

        // 🧮 Verfügbarkeit prüfen (ZIMMER, nicht Betten)
        if (
            single_beds > occupancy.available_single ||
            double_beds > occupancy.available_double ||
            quad_beds > occupancy.available_quad ||
            quint_beds > occupancy.available_quint ||
            sext_beds > occupancy.available_sext
        ) {
            return res.status(400).json({ error: "Nicht genügend freie Zimmer verfügbar." });
        }

        const booking = await Booking.create(
            {
                event_registration_id,
                event_id: registration.event_id,
                accommodation_id,
                user_id: userId,
                single_beds,
                double_beds,
                quad_beds,
                quint_beds,
                sext_beds,
            },
            { transaction: t }
        );

        await occupancy.update(
            {
                single_rooms_booked: occupancy.single_rooms_booked + single_beds,
                double_rooms_booked: occupancy.double_rooms_booked + double_beds,
                quad_rooms_booked: occupancy.quad_rooms_booked + quad_beds,
                quint_rooms_booked: occupancy.quint_rooms_booked + quint_beds,
                sext_rooms_booked: occupancy.sext_rooms_booked + sext_beds,
            },
            { transaction: t }
        );

        await t.commit();
        res.status(201).json(booking);
    } catch (err) {
        await t.rollback();
        next(err);
    }
};


// ============================================================
// 📋 Alle Buchungen (Admin oder Debug) – mit Event + Benutzer + Unterkunft
// ============================================================
exports.getAllBookings = async (req, res, next) => {
    try {
        const { Event, User, Person } = require("../models");

        const bookings = await Booking.findAll({
            include: [
                // 🔗 Verknüpfung zur Registrierung + Event
                {
                    model: EventRegistration,
                    as: "eventRegistration",
                    attributes: ["id", "event_id", "registered_by_person_id"],
                    include: [
                        {
                            model: Event,
                            as: "event",
                            attributes: ["id", "name", "start_date", "end_date"],
                        },
                    ],
                },

                // 🏨 Unterkunft
                {
                    model: Accommodation,
                    as: "accommodation",
                    attributes: ["id", "name", "city"],
                },

                // 👤 Benutzer + Person
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email"],
                    include: [
                        {
                            model: Person,
                            as: "person",
                            attributes: ["first_name", "last_name"],
                        },
                    ],
                },
            ],
            order: [
                [{ model: Accommodation, as: "accommodation" }, "name", "ASC"],
                ["createdAt", "DESC"],
            ],
        });

        if (!bookings.length) {
            return res.status(404).json({ message: "Keine Buchungen gefunden." });
        }

        res.status(200).json(bookings);
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
// ✏️ Buchung aktualisieren
// ============================================================
exports.updateBooking = async (req, res, next) => {
    const t = await Booking.sequelize.transaction();
    try {
        const { error } = bookingUpdateSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const booking = await Booking.findByPk(req.params.id, { transaction: t });
        if (!booking) return res.status(404).json({ error: "Buchung nicht gefunden." });

        const occupancy = await Occupancy.findOne({
            where: { event_id: booking.event_id, accommodation_id: booking.accommodation_id },
            lock: t.LOCK.UPDATE,
            transaction: t,
        });

        if (!occupancy) return res.status(404).json({ error: "Occupancy nicht gefunden." });

        const diff = {
            single: (req.body.single_beds ?? booking.single_beds) - booking.single_beds,
            double: (req.body.double_beds ?? booking.double_beds) - booking.double_beds,
            quad: (req.body.quad_beds ?? booking.quad_beds) - booking.quad_beds,
            quint: (req.body.quint_beds ?? booking.quint_beds) - booking.quint_beds,
            sext: (req.body.sext_beds ?? booking.sext_beds) - booking.sext_beds,
        };

        if (
            diff.single > occupancy.available_single ||
            diff.double > occupancy.available_double ||
            diff.quad > occupancy.available_quad ||
            diff.quint > occupancy.available_quint ||
            diff.sext > occupancy.available_sext
        ) {
            return res.status(400).json({ error: "Nicht genügend freie Zimmer verfügbar." });
        }

        await booking.update(req.body, { transaction: t });

        await occupancy.update(
            {
                single_rooms_booked: occupancy.single_rooms_booked + diff.single,
                double_rooms_booked: occupancy.double_rooms_booked + diff.double,
                quad_rooms_booked: occupancy.quad_rooms_booked + diff.quad,
                quint_rooms_booked: occupancy.quint_rooms_booked + diff.quint,
                sext_rooms_booked: occupancy.sext_rooms_booked + diff.sext,
            },
            { transaction: t }
        );

        await t.commit();
        res.json(booking);
    } catch (err) {
        await t.rollback();
        next(err);
    }
};


// ============================================================
// ❌ Buchung löschen
// ============================================================
exports.deleteBooking = async (req, res, next) => {
    const t = await Booking.sequelize.transaction();
    try {
        const booking = await Booking.findByPk(req.params.id, { transaction: t });
        if (!booking) return res.status(404).json({ error: "Buchung nicht gefunden." });

        const occupancy = await Occupancy.findOne({
            where: { event_id: booking.event_id, accommodation_id: booking.accommodation_id },
            lock: t.LOCK.UPDATE,
            transaction: t,
        });

        if (occupancy) {
            await occupancy.update(
                {
                    single_rooms_booked: occupancy.single_rooms_booked - booking.single_beds,
                    double_rooms_booked: occupancy.double_rooms_booked - booking.double_beds,
                    quad_rooms_booked: occupancy.quad_rooms_booked - booking.quad_beds,
                    quint_rooms_booked: occupancy.quint_rooms_booked - booking.quint_beds,
                    sext_rooms_booked: occupancy.sext_rooms_booked - booking.sext_beds,
                },
                { transaction: t }
            );
        }

        await booking.destroy({ transaction: t });
        await t.commit();

        res.json({ message: "Buchung gelöscht." });
    } catch (err) {
        await t.rollback();
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


// ============================================================
// 📋 Alle Buchungen eines bestimmten Benutzers (über alle Events)
// ============================================================
exports.getBookingsByUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: "userId ist erforderlich." });
        }

        // 🔍 Alle Buchungen des Benutzers holen
        const bookings = await Booking.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: EventRegistration,
                    as: "eventRegistration",
                    attributes: ["id", "event_id", "registered_by_person_id"],
                },
                {
                    model: Accommodation,
                    as: "accommodation",
                    attributes: ["id", "name", "city", "street", "postal_code"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: "Keine Buchungen gefunden." });
        }

        res.json(bookings);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Buchungen des Benutzers:", err);
        next(err);
    }
};



