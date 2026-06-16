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

async function getNextStartNumberForEvent(event_id, transaction) {
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
        transaction,
    });

    return typeof lastParticipant?.start_number === "number"
        ? lastParticipant.start_number + 1
        : 1;
}

async function getSharedSquadronStartNumber({ event_id, squadron_id, transaction }) {
    const existingParticipant = await EventRegistrationParticipant.findOne({
        where: { squadron_id },
        include: [
            {
                model: EventRegistration,
                as: "registration",
                where: { event_id },
                attributes: [],
            },
        ],
        order: [["createdAt", "ASC"]],
        transaction,
    });

    if (typeof existingParticipant?.start_number === "number") {
        return existingParticipant.start_number;
    }

    const squadron = await Squadron.findOne({
        where: { id: squadron_id, event_id },
        transaction,
    });

    if (!squadron) {
        throw new Error("Staffel nicht gefunden.");
    }

    const squadronStartNumber = Number(squadron.start_number);
    if (Number.isInteger(squadronStartNumber) && squadronStartNumber > 0) {
        return squadronStartNumber;
    }

    const nextStartNumber = await getNextStartNumberForEvent(event_id, transaction);
    await squadron.update({ start_number: String(nextStartNumber) }, { transaction });
    return nextStartNumber;
}

async function assignParticipantStartNumber({
    event_id,
    participation_type,
    squadron_id,
    transaction,
}) {
    if (participation_type === "staffel") {
        if (!squadron_id) {
            throw new Error("Für Staffel-Teilnehmer ist eine squadron_id erforderlich.");
        }

        return getSharedSquadronStartNumber({ event_id, squadron_id, transaction });
    }

    return getNextStartNumberForEvent(event_id, transaction);
}

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
                        {
                            model: Runtime,
                            as: "runtimes",
                        },
                    ],
                },
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

        for (const p of participants) {
            const participationType = p.participation_type ?? "einzeln";
            const squadronId = participationType === "staffel" ? (p.squadron_id ?? null) : null;
            const startNumber = await assignParticipantStartNumber({
                event_id,
                participation_type: participationType,
                squadron_id: squadronId,
                transaction: t,
            });

            await EventRegistrationParticipant.create(
                {
                    registration_id: registration.id,
                    person_id: p.person_id,
                    squadron_id: squadronId,
                    participation_type: participationType,
                    catering_type: p.catering_type ?? null,
                    start_number: startNumber,
                },
                { transaction: t }
            );
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

        const { error } = eventRegistrationSchema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true,
            context: { isUpdate: true },
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
// ➕ Teilnehmer zu bestehender Registrierung hinzufügen
//    ➜ Startnummer automatisch fortsetzen
// ============================================================
exports.addParticipant = async (req, res) => {
    const t = await EventRegistrationParticipant.sequelize.transaction();

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

        const registration = await EventRegistration.findByPk(registration_id, {
            transaction: t,
        });

        if (!registration) {
            return res.status(404).json({
                message: "Registrierung nicht gefunden.",
            });
        }

        const event_id = registration.event_id;

        const normalizedParticipationType = participation_type ?? "einzeln";
        const normalizedSquadronId = normalizedParticipationType === "staffel"
            ? (squadron_id ?? null)
            : null;

        const startNumber = await assignParticipantStartNumber({
            event_id,
            participation_type: normalizedParticipationType,
            squadron_id: normalizedSquadronId,
            transaction: t,
        });

        const participant = await EventRegistrationParticipant.create(
            {
                registration_id,
                person_id,
                squadron_id: normalizedSquadronId,
                participation_type: normalizedParticipationType,
                catering_type: catering_type ?? null,
                gender: gender ?? null,
                staffel_aufnahme: staffel_aufnahme ?? null,
                start_number: startNumber,
            },
            { transaction: t }
        );

        await t.commit();
        res.status(201).json(participant);
    } catch (err) {
        await t.rollback();
        console.error("❌ Fehler beim Hinzufügen eines Teilnehmers:", err);
        res.status(500).json({
            message: "Fehler beim Hinzufügen eines Teilnehmers.",
        });
    }
};


// ============================================================
// ✏️ Startnummer eines Teilnehmers ändern (Admin)
// ============================================================
exports.updateParticipantStartNumber = async (req, res) => {
    try {
        const { participantId } = req.params;
        const { start_number } = req.body;

        let newStartNumber = null;

        if (start_number === null || start_number === undefined || start_number === "") {
            return res.status(400).json({
                message: "start_number ist verpflichtend und muss eine positive Ganzzahl sein.",
            });
        }

        const parsed = Number(start_number);
        if (!Number.isInteger(parsed) || parsed < 1) {
            return res.status(400).json({
                message: "start_number ist verpflichtend und muss eine positive Ganzzahl sein.",
            });
        }

        newStartNumber = parsed;

        const participant = await EventRegistrationParticipant.findByPk(participantId, {
            include: [
                {
                    model: EventRegistration,
                    as: "registration",
                    attributes: ["event_id"],
                },
            ],
        });

        if (!participant) {
            return res.status(404).json({ message: "Teilnehmer nicht gefunden." });
        }

        const eventId = participant.registration?.event_id;

        if (eventId) {
            const existing = await EventRegistrationParticipant.findOne({
                where: { start_number: newStartNumber },
                include: [
                    {
                        model: EventRegistration,
                        as: "registration",
                        where: { event_id: eventId },
                        attributes: [],
                    },
                ],
            });

            const isSameSquadronUpdate =
                !!participant.squadron_id &&
                !!existing?.squadron_id &&
                existing.squadron_id === participant.squadron_id;

            if (existing && existing.id !== participant.id && !isSameSquadronUpdate) {
                return res.status(409).json({
                    message: `Startnummer ${newStartNumber} ist für dieses Event bereits vergeben.`,
                });
            }
        }

        if (participant.participation_type === "staffel" && participant.squadron_id) {
            await EventRegistrationParticipant.update(
                { start_number: newStartNumber },
                { where: { squadron_id: participant.squadron_id } }
            );

            await Squadron.update(
                { start_number: String(newStartNumber) },
                { where: { id: participant.squadron_id } }
            );
        } else {
            await participant.update({ start_number: newStartNumber });
        }

        res.json({
            message: "Startnummer erfolgreich aktualisiert.",
            participant: await EventRegistrationParticipant.findByPk(participantId),
        });
    } catch (err) {
        console.error("❌ Fehler beim Aktualisieren der Startnummer:", err);
        res.status(500).json({
            message: "Fehler beim Aktualisieren der Startnummer.",
        });
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
