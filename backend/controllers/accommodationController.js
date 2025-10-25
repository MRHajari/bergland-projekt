// ======================================================
// 🏨 Accommodation Controller – Vollständig & robust
// ======================================================

const {
    Accommodation,
    EventRegistration,
    Person,
    Occupancy,
    Event,
    Booking,
} = require("../models");

const createSchema = require("../validators/accommodationCreateValidator");
const updateSchema = require("../validators/accommodationUpdateValidator");

// ======================================================
// ➕ Neue Unterkunft erstellen
// ======================================================
exports.createAccommodation = async (req, res, next) => {
    try {
        const { error, value } = createSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error)
            return res.status(400).json({
                message: "Validierungsfehler",
                details: error.details.map((d) => d.message),
            });

        const accommodation = await Accommodation.create(value);
        res.status(201).json(accommodation);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Unterkunft:", err);
        next(err);
    }
};

// ======================================================
// 📋 Unterkünfte abrufen (Admin / Event / Benutzer)
// ======================================================
exports.getAllAccommodations = async (req, res, next) => {
    try {
        const accommodations = await Accommodation.findAll({
            include: [
                {
                    model: Occupancy,
                    as: "occupancies",
                    required: false, // auch Unterkünfte ohne Belegung laden
                    include: [
                        {
                            model: Event,
                            as: "event",
                            attributes: ["id", "name", "start_date", "end_date"],
                        },
                    ],
                },
            ],
            order: [["name", "ASC"]],
        });

        res.json(accommodations);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Unterkünfte:", err);
        next(err);
    }
};

// ======================================================
// 🔍 Einzelne Unterkunft per ID abrufen
// ======================================================
exports.getAccommodationById = async (req, res, next) => {
    try {
        const accommodation = await Accommodation.findByPk(req.params.id, {
            include: [
                {
                    model: Occupancy,
                    as: "occupancies",
                    include: [
                        {
                            model: Event,
                            as: "event",
                            attributes: ["id", "name", "start_date", "end_date"],
                        },
                    ],
                },
            ],
        });

        if (!accommodation)
            return res.status(404).json({ error: "Unterkunft nicht gefunden" });

        res.json(accommodation);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Unterkunft:", err);
        next(err);
    }
};

// ======================================================
// ✏️ Unterkunft aktualisieren
// ======================================================
exports.updateAccommodation = async (req, res, next) => {
    try {
        const { error, value } = updateSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error)
            return res.status(400).json({
                message: "Validierungsfehler",
                details: error.details.map((d) => d.message),
            });

        const accommodation = await Accommodation.findByPk(req.params.id);
        if (!accommodation)
            return res.status(404).json({ error: "Unterkunft nicht gefunden" });

        await accommodation.update(value);
        res.json({ message: "✅ Unterkunft erfolgreich aktualisiert", accommodation });
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Unterkunft:", err);
        next(err);
    }
};

// ======================================================
// ❌ Unterkunft löschen
// ======================================================
exports.deleteAccommodation = async (req, res, next) => {
    try {
        const accommodation = await Accommodation.findByPk(req.params.id);
        if (!accommodation)
            return res.status(404).json({ error: "Unterkunft nicht gefunden" });

        await accommodation.destroy();
        res.json({ message: "🗑️ Unterkunft gelöscht" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Unterkunft:", err);
        next(err);
    }
};

// ======================================================
// 🏨 Verfügbare Unterkünfte für ein Event (mit Restbetten)
// ======================================================
exports.getAccommodationsByEvent = async (req, res, next) => {
    const { eventId } = req.params;

    try {
        const occupancies = await Occupancy.findAll({
            where: { event_id: eventId },
            include: [
                {
                    model: Accommodation,
                    as: "accommodation",
                    include: [{ model: Booking, as: "bookings" }],
                },
            ],
        });

        if (!occupancies || occupancies.length === 0) {
            return res.status(404).json({
                error: "Keine Unterkünfte für dieses Event gefunden.",
            });
        }

        const result = occupancies.map((occ) => {
            const acc = occ.accommodation;

            // 🧮 Buchungszähler
            const bookedSingle = acc.bookings?.reduce(
                (sum, b) => sum + (b.single_beds || 0),
                0
            );
            const bookedDouble = acc.bookings?.reduce(
                (sum, b) => sum + (b.double_beds || 0),
                0
            );
            const bookedMulti = acc.bookings?.reduce(
                (sum, b) => sum + (b.multi_beds || 0),
                0
            );

            return {
                id: acc.id,
                name: acc.name,
                street: acc.street,
                postal_code: acc.postal_code,
                city: acc.city,
                description: acc.description,
                total_single: acc.single_rooms,
                total_double: acc.double_rooms,
                total_multi: acc.multi_bed_rooms,
                available_single: acc.single_rooms - bookedSingle,
                available_double: acc.double_rooms - bookedDouble,
                available_multi: acc.multi_bed_rooms - bookedMulti,
            };
        });

        res.json(result);
    } catch (err) {
        console.error("❌ Fehler beim Berechnen der Unterkunftsverfügbarkeit:", err);
        next(err);
    }
};
