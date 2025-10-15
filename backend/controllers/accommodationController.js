// backend/controllers/accommodationController.js
const { Accommodation, EventRegistration, Person, Occupancy, Event } = require("../models");
const accommodationSchema = require("../validators/accommodationValidator");

// ======================================================
// ➕ Neue Unterkunft erstellen
// ======================================================
exports.createAccommodation = async (req, res, next) => {
    try {
        const { error } = accommodationSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const accommodation = await Accommodation.create(req.body);
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
                    as: "occupancies", // 👈 wichtig: gleicher Alias wie in associations
                    include: [
                        {
                            model: Event,
                            as: "event", // 👈 ebenfalls identisch mit dem Alias im Occupancy-Modell
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
                    include: [{ model: Event, as: "event", attributes: ["id", "name"] }],
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
        const { error } = accommodationSchema.validate(req.body);
        if (error)
            return res.status(400).json({ error: error.details[0].message });

        const accommodation = await Accommodation.findByPk(req.params.id);
        if (!accommodation)
            return res.status(404).json({ error: "Unterkunft nicht gefunden" });

        await accommodation.update(req.body);
        res.json(accommodation);
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
        res.json({ message: "Unterkunft gelöscht" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Unterkunft:", err);
        next(err);
    }
};
