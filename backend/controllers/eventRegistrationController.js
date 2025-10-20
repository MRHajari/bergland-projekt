const {
    EventRegistration,
    EventRegistrationParticipant,  // ✅ hier direkt hinzufügen!
    Person,
    Event,
    Squadron,
    Runtime,
    User
} = require("../models");

const Joi = require("joi");
const eventRegistrationSchema = require("../validators/eventRegistrationValidator");

// ✅ Update-Schema aus dem normalen Schema ableiten
const eventRegistrationUpdateSchema = eventRegistrationSchema.fork(
    ["event_id", "user_id", "participation_type", "liability_accept"],
    (schema) => schema.optional()
);

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
        const {
            event_id,
            user_id,
            phone_number,
            license_plate,
            start_number,
            catering_type,
            wishes,
            gender,
            club,
            status,
        } = req.body;

        if (!event_id || !user_id)
            return res.status(400).json({ message: "event_id und user_id sind erforderlich." });

        const existing = await EventRegistration.findOne({ where: { event_id, user_id } });
        if (existing)
            return res.status(409).json({ message: "User ist bereits für dieses Event angemeldet." });

        const reg = await EventRegistration.create({
            event_id,
            user_id,
            phone_number,
            license_plate,
            start_number,
            catering_type,
            wishes,
            gender,
            club,
            status,
        });

        res.status(201).json(reg);
    } catch (err) {
        console.error("❌ Fehler beim Erstellen der Registrierung:", err);
        res.status(500).json({ message: "Fehler beim Erstellen der Registrierung." });
    }
};

// ============================================================
// ✏️ Anmeldung aktualisieren
// ============================================================
exports.updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        // Verwende das Update-Schema (nicht das Create-Schema)
        const { error } = eventRegistrationUpdateSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const registration = await EventRegistration.findByPk(id);
        if (!registration) {
            return res.status(404).json({ message: "Registrierung nicht gefunden." });
        }

        await registration.update(req.body);
        res.json(registration);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Registrierung:", err);
        res.status(500).json({ message: "Fehler beim Aktualisieren der Registrierung." });
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

// ============================================================
// ➕ Neue Gruppen-Registrierung (User + Teilnehmer-Liste)
// ============================================================
exports.createGroupRegistration = async (req, res) => {
    const t = await EventRegistration.sequelize.transaction();
    try {
        const {
            event_id,
            registered_by_person_id,
            phone_number,
            license_plate,
            catering_type,
            wishes,
            club,
            start_number,
            liability_accept,
            status,
            participants,
        } = req.body;

        if (!registered_by_person_id || !Array.isArray(participants)) {
            return res
                .status(400)
                .json({ message: "registered_by_person_id und participants[] erforderlich." });
        }

        // 🔹 Registrierung anlegen
        const registration = await EventRegistration.create(
            {
                event_id,
                registered_by_person_id,
                phone_number,
                license_plate,
                catering_type,
                wishes,
                club,
                start_number,
                liability_accept,
                status,
            },
            { transaction: t }
        );

        // 🔹 Teilnehmer anlegen
        for (const p of participants) {
            await EventRegistrationParticipant.create(
                {
                    registration_id: registration.id,
                    person_id: p.person_id,
                    squadron_id: p.squadron_id || null,
                    participation_type: p.participation_type || "einzeln",
                },
                { transaction: t }
            );
        }

        await t.commit();
        console.log(`✅ Gruppen-Registrierung erstellt: ${registration.id}`);
        res.status(201).json({ registration });
    } catch (err) {
        await t.rollback();
        console.error("❌ Fehler beim Erstellen der Gruppen-Registrierung:", err);
        res.status(500).json({ message: "Fehler beim Erstellen der Gruppen-Registrierung." });
    }
};

// ============================================================
// 📦 Registrierungen eines Events mit Teilnehmern abrufen
// ============================================================
exports.getGroupByEvent = async (req, res) => {
    try {
        const regs = await EventRegistration.findAll({
            where: { event_id: req.params.eventId },
            include: [
                { model: User, as: "user", attributes: ["id", "email"] },
                {
                    model: EventRegistrationParticipant,
                    as: "participants",
                    include: [{ model: Person, as: "person", attributes: ["id", "first_name", "last_name"] }],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(regs);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Gruppen:", err);
        res.status(500).json({ message: "Fehler beim Laden der Gruppen." });
    }
};


// ============================================================
// 🟢 Nur den Status einer Registrierung ändern (Admin)
// ============================================================
exports.updateRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const reg = await EventRegistration.findByPk(id);
        if (!reg) return res.status(404).json({ message: "Registrierung nicht gefunden." });

        await reg.update({ status });
        res.json({ message: "Status erfolgreich aktualisiert." });
    } catch (err) {
        console.error("❌ Fehler beim Ändern des Status:", err);
        res.status(500).json({ message: "Fehler beim Ändern des Status." });
    }
};


// ==================================================
// ➕ Teilnehmer zu bestehender Registrierung hinzufügen
// ==================================================
exports.addParticipant = async (req, res) => {
    try {
        const {
            registration_id,
            person_id,
            squadron_id,
            participation_type,
            liability_accept,
        } = req.body;

        if (!registration_id || !person_id) {
            return res
                .status(400)
                .json({ message: "registration_id und person_id sind erforderlich." });
        }

        const participant = await EventRegistrationParticipant.create({
            registration_id,
            person_id,
            squadron_id: squadron_id || null,
            participation_type: participation_type || "einzeln",
            liability_accept: liability_accept ?? true,
        });

        res.status(201).json(participant);
    } catch (err) {
        console.error("❌ Fehler beim Hinzufügen eines Teilnehmers:", err);
        res
            .status(500)
            .json({ message: "Fehler beim Hinzufügen eines Teilnehmers." });
    }
};


// ============================================================
// 🔍 Registrierungen eines Users (inkl. Teilnehmer & Event)
// ============================================================
exports.getByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('🔍 Suche Registrierungen für user_id =', userId);

        const regs = await EventRegistration.findAll({
            where: { user_id: userId },
            include: [
                { model: Event, as: "event" },
                {
                    model: EventRegistrationParticipant,
                    as: "participants",
                    include: [{ model: Person, as: "person" }],
                },
            ],
        });

        console.log('📦 Gefundene Registrierungen:', regs.length);
        res.json(regs);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Registrierungen für User:", err);
        res.status(500).json({ message: "Fehler beim Laden der Registrierungen für User." });
    }
};




