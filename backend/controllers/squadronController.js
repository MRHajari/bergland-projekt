const { Squadron, Event, EventRegistration, Person } = require("../models");
const squadronSchema = require("../validators/squadronValidator");

// ➕ Neue Staffel erstellen
exports.createSquadron = async (req, res) => {
    try {
        const data = req.body;

        // 🧠 SQLite akzeptiert kein undefined/"" als FK → korrekt auf NULL setzen
        if (!data.event_id || data.event_id === "undefined" || data.event_id === "") {
            return res.status(400).json({ message: "event_id ist erforderlich und muss gültig sein." });
        }

        // Mitgliederzahl optional
        if (!data.members_count) data.members_count = 0;

        const newSquadron = await Squadron.create(data);
        return res.status(201).json(newSquadron);
    } catch (error) {
        console.error("❌ Fehler beim Erstellen der Staffel:", error);
        return res.status(500).json({
            message: error.message || "Fehler beim Erstellen der Staffel.",
        });
    }
};

// 📋 Alle Staffeln (inkl. Mitglieder)
exports.getAllSquadrons = async (req, res, next) => {
    try {
        const squadrons = await Squadron.findAll({
            include: [
                { model: Event, as: "event", attributes: ["id", "name", "date"] },
                {
                    model: Person,
                    attributes: ["id", "first_name", "last_name", "email"],
                    through: { attributes: ["note"] }, // aus rel_person_squadron
                },
                { model: EventRegistration, as: "eventRegistrations" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(squadrons);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Staffeln:", err);
        next(err);
    }
};

// 🔍 Staffeln eines bestimmten Events
exports.getByEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const squadrons = await Squadron.findAll({
            where: { event_id: eventId },
            include: [
                {
                    model: Person,
                    attributes: ["id", "first_name", "last_name"],
                    through: { attributes: ["note"] },
                },
            ],
        });
        res.json(squadrons);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Staffeln für Event:", err);
        next(err);
    }
};

// 🔎 Staffel per ID (inkl. Mitglieder)
exports.getSquadronById = async (req, res, next) => {
    try {
        const squadron = await Squadron.findByPk(req.params.id, {
            include: [
                { model: Event, as: "event" },
                { model: EventRegistration, as: "eventRegistrations" },
                {
                    model: Person,
                    attributes: ["id", "first_name", "last_name", "email"],
                    through: { attributes: ["note"] },
                },
            ],
        });
        if (!squadron) return res.status(404).json({ error: "Squadron not found" });
        res.json(squadron);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Staffel:", err);
        next(err);
    }
};

// ✏️ Staffel aktualisieren
exports.updateSquadron = async (req, res, next) => {
    try {
        const { error } = squadronSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const squadron = await Squadron.findByPk(req.params.id);
        if (!squadron) return res.status(404).json({ error: "Squadron not found" });

        await squadron.update(req.body);
        res.json(squadron);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Staffel:", err);
        next(err);
    }
};

// ❌ Staffel löschen
exports.deleteSquadron = async (req, res, next) => {
    try {
        const squadron = await Squadron.findByPk(req.params.id);
        if (!squadron) return res.status(404).json({ error: "Squadron not found" });

        await squadron.destroy();
        res.json({ message: "Squadron deleted successfully" });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Staffel:", err);
        next(err);
    }
};
