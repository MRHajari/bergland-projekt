// backend/controllers/eventController.js
const {
    Event,
    EventRegistration,
    Squadron,
    Route,
    Occupancy,
    Booking,
    Person,
    Accommodation,
    EventRoute
} = require("../models");

const { validateEvent, validateEventUpdate } = require("../validators/eventValidator");

// ============================================================
// 📋 Alle Events abrufen (mit Strecken + Unterkünften)
// ============================================================
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [
                {
                    model: EventRoute,
                    as: "eventRoutes",
                    include: [
                        {
                            model: Route,
                            as: "route",
                        },
                    ],
                },
                { model: Squadron, as: "squadrons" },
                { model: EventRegistration, as: "eventRegistrations" },
                {
                    model: Occupancy,
                    as: "occupancies",
                    include: [
                        {
                            model: Accommodation,
                            as: "accommodation",
                            attributes: ["id", "name", "city", "street", "postal_code"],
                        },
                    ],
                },
            ],
            order: [["start_date", "ASC"]],
        });

        res.json(events);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der Events:", error);
        res.status(500).json({
            message: "Fehler beim Laden der Events",
            error: error.message,
        });
    }
};


// ============================================================
// 🔍 Einzelnes Event mit allen Details abrufen
// ============================================================
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [
                {
                    model: EventRoute,
                    as: "eventRoutes",
                    include: [
                        {
                            model: Route,
                            as: "route",
                        },
                    ],
                },
                { model: Squadron, as: "squadrons" },
                {
                    model: EventRegistration,
                    as: "eventRegistrations",
                    include: [
                        {
                            model: Person,
                            as: "registered_by_person",
                            attributes: ["id", "first_name", "last_name", "email"],
                        },
                    ],
                },
                { model: Occupancy, as: "occupancies" },
                { model: Booking, as: "bookings" },
            ],
        });

        if (!event)
            return res.status(404).json({ message: "Event nicht gefunden." });

        res.json(event);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen des Events:", err);
        res.status(500).json({ message: "Fehler beim Laden des Events." });
    }
};


// ============================================================
// ➕ Neues Event erstellen
// ============================================================
exports.createEvent = async (req, res) => {
    try {
        console.log("📥 Event-Daten erhalten:", req.body);

        const { error, value } = validateEvent(req.body);
        if (error) {
            console.warn(
                "⚠️ Validierungsfehler:",
                error.details.map((d) => d.message)
            );
            return res.status(400).json({
                message: "Validierungsfehler",
                details: error.details.map((d) => d.message),
            });
        }

        const event = await Event.create(value);
        console.log("✅ Event erfolgreich erstellt:", event.name);

        res.status(201).json(event);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen des Events:", err);
        res.status(500).json({ message: "Fehler beim Erstellen des Events." });
    }
};


// ============================================================
// ✏️ Event aktualisieren
// ============================================================
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event)
            return res.status(404).json({ message: "Event nicht gefunden." });

        const { error, value } = validateEventUpdate(req.body);
        if (error) {
            console.warn("⚠️ Joi-Fehlerdetails:", error.details.map(d => d.message));
            return res.status(400).json({
                message: "Validierungsfehler",
                details: error.details.map((d) => d.message),
            });
        }

        await event.update(value);
        res.json({ message: "✅ Event aktualisiert", event });
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren des Events:", err);
        res.status(500).json({ message: "Fehler beim Aktualisieren des Events." });
    }
};


// ============================================================
// ❌ Event löschen
// ============================================================
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event)
            return res.status(404).json({ message: "Event nicht gefunden." });

        await event.destroy();
        res.json({ message: "🗑️ Event erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen des Events:", err);
        res.status(500).json({ message: "Fehler beim Löschen des Events." });
    }
};
