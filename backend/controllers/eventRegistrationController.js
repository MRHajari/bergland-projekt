// backend/controllers/eventRegistrationController.js
const {
    EventRegistration,
    EventRegistrationParticipant,
    Person,
    Event,
    Squadron,
    Runtime,
} = require("../models");

const eventRegistrationSchema = require("../validators/eventRegistrationValidator");

// ============================================================
// 🎟️ EventRegistration Controller
// ============================================================


// ============================================================
// 📋 Alle Anmeldungen abrufen
// ============================================================
exports.getAllRegistrations = async (req, res) => {
    try {
        const regs = await EventRegistration.findAll({
            include: [
                {
                    model: Person,
                    as: "registered_by_person",
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
                {
                    model: Person,
                    as: "registered_by_person",
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
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
        });

        if (!reg) {
            return res.status(404).json({ message: "Anmeldung nicht gefunden." });
        }

        res.json(reg);
    } catch (err) {
        console.error("❌ Fehler beim Abrufen der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Abrufen der Anmeldung." });
    }
};


// ============================================================
// ➕ Neue Gruppen-Registrierung erstellen
//    ➜ Startnummern automatisch pro Event
// ============================================================
exports.createGroupRegistration = async (req, res) => {
    const t = await EventRegistration.sequelize.transaction();

    try {
        const {
            event_id,
            registered_by_person_id,
            phone_number,
            license_plate,
            wishes,
            club,
            status,
            participants,
        } = req.body;

        if (!registered_by_person_id || !Array.isArray(participants)) {
            return res.status(400).json({
                message: "registered_by_person_id und participants[] erforderlich.",
            });
        }

        // --------------------------------------------------------
        // 🔹 Registrierung (Kopf)
        // --------------------------------------------------------
        const registration = await EventRegistration.create(
            {
                event_id,
                registered_by_person_id,
                phone_number,
                license_plate,
                wishes,
                club,
                status,
            },
            { transaction: t }
        );

        // --------------------------------------------------------
        // 🔢 Startnummern-Logik (pro Event fortlaufend)
        // --------------------------------------------------------
        const lastParticipant = await EventRegistrationParticipant.findOne({
            include: [
                {
                    model: EventRegistration,
                    as: "registration",
                    where: { event_id },
                    attributes: [],
                },
            ],
            order: [["start_number", "DESC"]],
            transaction: t,
        });

        let nextStartNumber =
            typeof lastParticipant?.start_number === "number"
                ? lastParticipant.start_number + 1
                : 1;

        // --------------------------------------------------------
        // 👥 Teilnehmer anlegen
        // --------------------------------------------------------
        for (const p of participants) {
            await EventRegistrationParticipant.create(
                {
                    registration_id: registration.id,
                    person_id: p.person_id,
                    squadron_id: p.squadron_id || null,
                    participation_type: p.participation_type || "einzeln",
                    catering_type: p.catering_type ?? null,
                    start_number: nextStartNumber,
                },
                { transaction: t }
            );

            nextStartNumber++;
        }

        await t.commit();
        res.status(201).json({ registration });
    } catch (err) {
        await t.rollback();
        console.error("❌ Fehler beim Erstellen der Gruppen-Registrierung:", err);
        res.status(500).json({
            message: "Fehler beim Erstellen der Gruppen-Registrierung.",
        });
    }
};


// ============================================================
// ✏️ Registrierung (nur Kopf-Daten) aktualisieren
// ============================================================
exports.updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ UPDATE-spezifische Validierung (OHNE event_id)
        const { error } = eventRegistrationSchema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true,
            context: { isUpdate: true }, // 🔥 DAS ist der Schlüssel
        });

        if (error) {
            return res.status(400).json({
                message: error.details.map(d => d.message).join(", "),
            });
        }

        const registration = await EventRegistration.findByPk(id);
        if (!registration) {
            return res.status(404).json({
                message: "Registrierung nicht gefunden.",
            });
        }

        const {
            phone_number,
            license_plate,
            wishes,
            club,
            status,
        } = req.body;

        await registration.update({
            phone_number,
            license_plate,
            wishes,
            club,
            status,
        });

        res.json(registration);
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Registrierung:", err);
        res.status(500).json({
            message: "Fehler beim Aktualisieren der Registrierung.",
        });
    }
};



// ============================================================
// 📦 Registrierungen eines Events mit Teilnehmern
// ============================================================
exports.getGroupByEvent = async (req, res) => {
    try {
        const regs = await EventRegistration.findAll({
            where: { event_id: req.params.eventId },
            include: [
                {
                    model: Person,
                    as: "registered_by_person",
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
                            attributes: ["id", "name"],
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
// 🔍 Registrierungen nach Person (Ersteller)
// ============================================================
exports.getRegistrationsByPerson = async (req, res) => {
    try {
        const { personId } = req.params;

        const regs = await EventRegistration.findAll({
            where: {
                registered_by_person_id: personId,
            },
            include: [
                {
                    model: Event,
                    as: "event",
                },
                {
                    model: EventRegistrationParticipant,
                    as: "participants",
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(regs);
    } catch (err) {
        console.error("❌ Fehler beim Laden der Registrierungen der Person:", err);
        res.status(500).json({
            message: "Fehler beim Laden der Registrierungen der Person.",
        });
    }
};


// ============================================================
// ➕ Teilnehmer zu bestehender Registrierung hinzufügen
// ============================================================
exports.addParticipant = async (req, res) => {
    try {
        const {
            registration_id,
            person_id,
            squadron_id,
            participation_type,
            catering_type,
            gender,
            staffel_aufnahme,
        } = req.body;

        if (!registration_id || !person_id) {
            return res.status(400).json({
                message: "registration_id und person_id sind erforderlich.",
            });
        }

        const participant = await EventRegistrationParticipant.create({
            registration_id,
            person_id,
            squadron_id: squadron_id ?? null,
            participation_type: participation_type ?? "einzeln",
            catering_type: catering_type ?? null,
            gender: gender ?? null,
            staffel_aufnahme: staffel_aufnahme ?? null,
        });

        res.status(201).json(participant);
    } catch (err) {
        console.error("❌ Fehler beim Hinzufügen eines Teilnehmers:", err);
        res.status(500).json({
            message: "Fehler beim Hinzufügen eines Teilnehmers.",
        });
    }
};



// ============================================================
// 🗑️ Registrierung löschen
// ============================================================
exports.deleteRegistration = async (req, res) => {
    try {
        const reg = await EventRegistration.findByPk(req.params.id);
        if (!reg) {
            return res.status(404).json({ message: "Anmeldung nicht gefunden." });
        }

        await reg.destroy();
        res.json({ message: "Anmeldung erfolgreich gelöscht." });
    } catch (err) {
        console.error("❌ Fehler beim Löschen der Anmeldung:", err);
        res.status(500).json({ message: "Fehler beim Löschen der Anmeldung." });
    }
};
