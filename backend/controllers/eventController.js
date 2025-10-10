const { Event, EventRegistration, Squadron, Route, Occupancy, Booking, Person } = require("../models");
const { eventSchema } = require("../validators/eventValidator");


// ============================================================
// 📋 Alle Events mit zugehörigen Daten abrufen
// ============================================================
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [
                { model: Route, as: "routes" }, // ✅ richtiges Alias
                { model: Squadron, as: "squadrons" }, // ✅ Plural (nicht "squadron")
                { model: EventRegistration, as: "eventRegistrations" }, // ✅ korrekt
            ],
            order: [["start_date", "ASC"]],
        });

        // Option: gleich die Anzahl dazupacken
        const result = events.map(e => ({
            ...e.toJSON(),
            route_count: e.routes?.length || 0,
            squadron_count: e.squadrons?.length || 0,
            registration_count: e.eventRegistrations?.length || 0,
        }));

        res.json(result);
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der Events:", error);
        res.status(500).json({
            message: "Fehler beim Laden der Events",
            error: error.message,
        });
    }
};


// ============================================================
// 🔍 Einzelnes Event mit Details abrufen
// ============================================================
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id, {
            include: [
                { model: Squadron, as: "squadrons" },
                {
                    model: EventRegistration,
                    as: "eventRegistrations",
                    include: [{ model: Person, as: "person", attributes: ["first_name", "last_name"] }],
                },
                { model: Route, as: "routes" },
                { model: Occupancy, as: "occupancies" },
                { model: Booking, as: "bookings" },
            ],
        });

        if (!event) return res.status(404).json({ message: "Event nicht gefunden." });

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
        const { error, value } = eventSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const event = await Event.create(value);
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
        if (!event) return res.status(404).json({ message: "Event nicht gefunden." });

        const { error, value } = eventSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        await event.update(value);
        res.json(event);
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
        if (!event) return res.status(404).json({ message: "Event nicht gefunden." });

        await event.destroy();
        res.json({ message: "Event erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen des Events:", err);
        res.status(500).json({ message: "Fehler beim Löschen des Events." });
    }
};
