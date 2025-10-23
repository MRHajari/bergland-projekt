// backend/controllers/eventRegistrationController.js
const {
    EventRegistration,
    EventRegistrationParticipant,
    Person,
    Event,
    Squadron,
    Runtime,
    User,
} = require("../models");

const Joi = require("joi");
const eventRegistrationSchema = require("../validators/eventRegistrationValidator");

// ✅ Update-Schema ableiten
const eventRegistrationUpdateSchema = eventRegistrationSchema.fork(
    ["event_id", "user_id", "participation_type", "liability_accept"],
    (schema) => schema.optional()
);

/**
 * 🎟️ EventRegistration Controller
 * CRUD-Logik für Anmeldungen (Gruppen & Einzelpersonen)
 */

// ============================================================
// 📋 Alle Anmeldungen abrufen
// ============================================================
exports.getAllRegistrations = async (req, res) => {
    try {
        const regs = await EventRegistration.findAll({
            include: [
                {
                    model: Person,
                    as: "registered_by_person", // ✅ korrekt
                    attributes: ["id", "first_name", "last_name", "email"],
                },
                { model: Event, as: "event" },
                {
                    model: Squadron,
                    as: "squadron",
                    attributes: ["id", "name"],
                },
                { model: Runtime, as: "runtimes" },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json(regs);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Event-Registrierungen:", err);
        res
            .status(500)
            .json({ message: "Fehler beim Laden der Event-Registrierungen." });
    }
};

// ============================================================
// 🔍 Einzelne Anmeldung nach ID
// ============================================================
exports.getRegistrationById = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id, {
            include: [
                {
                    model: Person,
                    as: "registered_by_person", // ✅ korrigiert
                    attributes: ["id", "first_name", "last_name", "email"],
                },
                { model: Event, as: "event" },
                { model: Squadron, as: "squadron" },
                {
                    model: EventRegistrationParticipant,
                    as: "participants",
                    include: [
                        {
                            model: Person,
                            as: "person",
                            attributes: ["id", "first_name", "last_name", "email"],
                        },
                        {
                            model: Squadron,
                            as: "squadron",
                            attributes: ["id", "name", "start_number"],
                        },
                    ],
                },
            ],
        });

        if (!reg)
            return res.status(404).json({ message: "Anmeldung nicht gefunden." });

        res.json(reg);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Abrufen der Anmeldung." });
    }
};

// ============================================================
// ➕ Neue Gruppen- oder Einzel-Anmeldung erstellen
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
            return res.status(400).json({
                message: "registered_by_person_id und participants[] erforderlich.",
            });
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

        // 🔹 Teilnehmer hinzufügen
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
        res
            .status(500)
            .json({ message: "Fehler beim Erstellen der Gruppen-Registrierung." });
    }
};

// ============================================================
// ✏️ Anmeldung aktualisieren
// ============================================================
exports.updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = eventRegistrationUpdateSchema.validate(req.body, {
            abortEarly: false,
        });
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
        res
            .status(500)
            .json({ message: "Fehler beim Aktualisieren der Registrierung." });
    }
};

// ============================================================
// 🗑️ Anmeldung löschen (nach ID)
// ============================================================
exports.deleteRegistration = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id);
        if (!reg)
            return res.status(404).json({ message: "Anmeldung nicht gefunden." });

        await reg.destroy();
        res.json({ message: "Anmeldung erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Löschen der Anmeldung." });
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
                {
                    model: Person,
                    as: "registered_by_person", // ✅ wichtig
                    attributes: ["id", "first_name", "last_name", "email"],
                },
                {
                    model: EventRegistrationParticipant,
                    as: "participants",
                    include: [
                        {
                            model: Person,
                            as: "person",
                            attributes: ["id", "first_name", "last_name", "email"],
                        },
                        {
                            model: Squadron,
                            as: "squadron",
                            attributes: ["id", "name", "start_number"],
                        },
                    ],
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
// 🔍 Registrierungen eines Users abrufen
// ============================================================
exports.getByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("🔍 Suche Registrierungen für user_id =", userId);

        // 1️⃣ Finde Personen, die diesem User gehören
        const persons = await Person.findAll({ where: { owner_id: userId } });

        if (!persons || persons.length === 0) {
            console.warn("⚠️ Keine Personen zu diesem Benutzer gefunden.");
            return res.json([]);
        }

        const personIds = persons.map((p) => p.id);
        console.log("👤 Gefundene Personen:", personIds);

        // 2️⃣ Lade Registrierungen, die diese Personen erstellt haben
        const regs = await EventRegistration.findAll({
            where: { registered_by_person_id: personIds },
            include: [
                {
                    model: Event,
                    as: "event",
                    attributes: ["id", "name", "start_date", "end_date"],
                },
                {
                    model: EventRegistrationParticipant,
                    as: "participants",
                    include: [
                        {
                            model: Person,
                            as: "person",
                            attributes: ["id", "first_name", "last_name"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        console.log("📦 Gefundene Registrierungen:", regs.length);
        res.json(regs);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Registrierungen für User:", err);
        res
            .status(500)
            .json({ message: "Fehler beim Laden der Registrierungen für User." });
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
        if (!reg)
            return res.status(404).json({ message: "Registrierung nicht gefunden." });

        await reg.update({ status });
        res.json({ message: "Status erfolgreich aktualisiert." });
    } catch (err) {
        console.error("❌ Fehler beim Ändern des Status:", err);
        res.status(500).json({ message: "Fehler beim Ändern des Status." });
    }
};


// ============================================================
// 📊 Anzahl Registrierungen pro Event (alle Events)
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

        const result = counts.map((row) => ({
            event_id: row.event_id,
            count: parseInt(row.dataValues.count, 10),
        }));

        res.json(result);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Anmeldungszahlen:", err);
        res.status(500).json({ message: "Fehler beim Abrufen der Anmeldungszahlen." });
    }
};
