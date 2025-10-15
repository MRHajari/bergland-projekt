const { EventRegistration, Person, Event, Squadron, Runtime } = require("../models");
const eventRegistrationSchema = require("../validators/eventRegistrationValidator");

/**
 * 🎟️ EventRegistration Controller
 * CRUD-Logik für Anmeldungen einer Person zu einem Event
 */

// ============================================================
// 📋 Alle Anmeldungen abrufen
// ============================================================
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
        res.status(500).json({ message: "Fehler beim Laden der Event-Registrierungen." });
    }
};

// ============================================================
// 🔍 Einzelne Anmeldung nach ID
// ============================================================
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

        if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden." });
        res.json(reg);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Abrufen der Anmeldung." });
    }
};

// ============================================================
// ➕ Neue Anmeldung erstellen
// ============================================================
exports.createRegistration = async (req, res) => {
    try {
        const { error, value } = eventRegistrationSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { person_id, event_id } = value;
        if (!person_id || !event_id)
            return res.status(400).json({ message: "person_id und event_id sind erforderlich." });

        // 🧩 Existenzprüfung
        const person = await Person.findByPk(person_id);
        const event = await Event.findByPk(event_id);
        if (!person) return res.status(404).json({ message: "Person nicht gefunden." });
        if (!event) return res.status(404).json({ message: "Event nicht gefunden." });

        // 🧠 Doppelprüfung
        const existing = await EventRegistration.findOne({ where: { person_id, event_id } });
        if (existing) {
            return res.status(409).json({
                message: `Die Person "${person.first_name} ${person.last_name}" ist bereits für dieses Event angemeldet.`,
                existing_id: existing.id,
            });
        }

        // ✅ Registrierung erstellen
        const registration = await EventRegistration.create(value);
        console.log(`✅ Neue Registrierung: Person ${person_id} → Event ${event_id}`);
        res.status(201).json(registration);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Erstellen der Anmeldung." });
    }
};

// ============================================================
// ✏️ Anmeldung aktualisieren
// ============================================================
exports.updateRegistration = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id);
        if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden." });

        const { error, value } = eventRegistrationSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // prüfen auf doppelte Kombination
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
                    message: "Diese Person ist für dieses Event bereits angemeldet (doppelt).",
                });
            }
        }

        await reg.update(value);
        console.log(`✏️ Registrierung ${reg.id} aktualisiert.`);
        res.json(reg);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Aktualisieren der Anmeldung." });
    }
};

// ============================================================
// ❌ Anmeldung löschen (nach ID)
// ============================================================
exports.deleteRegistration = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id);
        if (!reg) return res.status(404).json({ message: "Anmeldung nicht gefunden." });

        await reg.destroy();
        res.json({ message: "Anmeldung erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Löschen der Anmeldung." });
    }
};

// ============================================================
// 🔹 Registrierung nach Person-ID
// ============================================================
exports.getByPersonId = async (req, res) => {
    try {
        const { personId } = req.params;

        const regs = await EventRegistration.findAll({
            where: { person_id: personId },
            include: [
                { model: Person, as: "person", attributes: ["first_name", "last_name"] },
                { model: Event, as: "event", attributes: ["name", "start_date"] },
                { model: Squadron, as: "squadron", attributes: ["name", "start_number"] },
                { model: Runtime, as: "runtimes" },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(regs || []);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Registrierungen für Person:", err);
        res.status(500).json({ message: "Fehler beim Laden der Registrierungen für Person." });
    }
};

// ============================================================
// 🗑️ Person aus Event entfernen (aber Person bleibt bestehen)
// ============================================================
exports.deleteByPersonAndEvent = async (req, res) => {
    try {
        const { event_id, person_id } = req.params;

        if (!event_id || !person_id)
            return res.status(400).json({ message: "event_id und person_id sind erforderlich." });

        const registration = await EventRegistration.findOne({ where: { event_id, person_id } });
        if (!registration)
            return res.status(404).json({ message: "Registrierung nicht gefunden." });

        await registration.destroy();
        console.log(`🗑️ Person ${person_id} wurde aus Event ${event_id} entfernt.`);
        res.json({ message: "Person wurde aus diesem Event entfernt." });
    } catch (err) {
        console.error("❌ Fehler beim Entfernen der Person aus dem Event:", err);
        res.status(500).json({ message: "Fehler beim Entfernen der Person aus dem Event." });
    }
};

// ============================================================
// 📊 Anzahl Registrierungen pro Event abrufen
// ============================================================
exports.getCountByEvent = async (req, res) => {
    try {
        const counts = await EventRegistration.findAll({
            attributes: [
                "event_id",
                [EventRegistration.sequelize.fn("COUNT", EventRegistration.sequelize.col("event_id")), "count"],
            ],
            group: ["event_id"],
        });

        const result = {};
        counts.forEach((c) => {
            result[c.event_id] = parseInt(c.dataValues.count);
        });

        res.json(result);
    } catch (err) {
        console.error("❌ Fehler beim Zählen der Registrierungen:", err);
        res.status(500).json({ message: "Fehler beim Abrufen der Anmeldungszahlen." });
    }
};

exports.getByEventId = async (req, res) => {
    try {
        const regs = await EventRegistration.findAll({
            where: { event_id: req.params.eventId },
            include: [{ model: Person, as: 'person' }],
        });
        res.json(regs);
    } catch (err) {
        console.error('❌ Fehler beim Laden der Event-Registrierungen:', err);
        res.status(500).json({ message: err.message });
    }
};

