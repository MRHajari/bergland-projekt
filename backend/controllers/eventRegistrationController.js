const { EventRegistration, Person, Event, Squadron, Runtime } = require("../models");
const eventRegistrationSchema = require("../validators/eventRegistrationValidator");

/**
 * 🎟️ EventRegistration Controller
 * CRUD-Logik für Anmeldungen einer Person zu einem Event
 */

// 📋 Alle Anmeldungen abrufen
exports.getAllRegistrations = async (req, res) => {
    try {
        const regs = await EventRegistration.findAll({
            include: [
                { model: Person, as: "person" },
                { model: Event, as: "event" },
                { model: Squadron, as: "squadron" },
                { model: Runtime, as: "runtimes" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(regs);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Event-Registrierungen:", err);
        res.status(500).json({ message: err.message });
    }
};

// 🔍 Einzelne Anmeldung nach ID
exports.getRegistrationById = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id, {
            include: [
                { model: Person, as: "person" },
                { model: Event, as: "event" },
                { model: Squadron, as: "squadron" },
                { model: Runtime, as: "runtimes" },
            ],
        });

        if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden" });
        res.json(reg);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Anmeldung:", err);
        res.status(500).json({ message: err.message });
    }
};

// ➕ Neue Anmeldung erstellen
exports.createRegistration = async (req, res) => {
    try {
        const { error, value } = eventRegistrationSchema.validate(req.body);
        if (error)
            return res.status(400).json({ message: error.details[0].message });

        // Prüfen, ob Person für das Event bereits registriert ist
        const existing = await EventRegistration.findOne({
            where: { person_id: value.person_id, event_id: value.event_id },
        });

        if (existing) {
            return res.status(409).json({
                message: "Diese Person ist für dieses Event bereits angemeldet.",
            });
        }

        const registration = await EventRegistration.create(value);
        res.status(201).json(registration);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Anmeldung:", err);

        // Fehler durch Unique-Constraint (Fallback, falls Datenbank den Fehler wirft)
        if (err.name === "SequelizeUniqueConstraintError") {
            return res
                .status(409)
                .json({ message: "Diese Person ist für dieses Event bereits angemeldet." });
        }

        res.status(500).json({ message: err.message });
    }
};

// ✏️ Anmeldung aktualisieren
exports.updateRegistration = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id);
        if (!reg)
            return res.status(404).json({ message: "Anmeldung nicht gefunden" });

        const { error, value } = eventRegistrationSchema.validate(req.body);
        if (error)
            return res.status(400).json({ message: error.details[0].message });

        // Optional: prüfen, ob Update auf bereits verwendete Kombination führt
        if (
            value.person_id &&
            value.event_id &&
            (value.person_id !== reg.person_id || value.event_id !== reg.event_id)
        ) {
            const duplicate = await EventRegistration.findOne({
                where: { person_id: value.person_id, event_id: value.event_id },
            });
            if (duplicate) {
                return res.status(409).json({
                    message:
                        "Diese Person ist für dieses Event bereits angemeldet (doppelte Kombination).",
                });
            }
        }

        await reg.update(value);
        res.json(reg);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Anmeldung:", err);
        res.status(500).json({ message: err.message });
    }
};

// ❌ Anmeldung löschen
exports.deleteRegistration = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id);
        if (!reg)
            return res.status(404).json({ message: "Anmeldung nicht gefunden" });

        await reg.destroy();
        res.json({ message: "Anmeldung erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Anmeldung:", err);
        res.status(500).json({ message: err.message });
    }
};
