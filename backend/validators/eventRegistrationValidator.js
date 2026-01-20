const Joi = require("joi");

/**
 * 🧾 EventRegistration Validator (Kopf-Daten)
 * Validiert NUR die Registrierungs-Kopfdaten eines Events.
 * Teilnehmer-spezifische Felder (gender, catering, participation)
 * werden bewusst NICHT hier validiert.
 */
const eventRegistrationSchema = Joi.object({
    // ===============================
    // 🆔 IDs
    // ===============================
    event_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "Event-ID ist erforderlich.",
            "string.guid": "Event-ID muss eine gültige UUID sein.",
        }),

    // 👉 Wird im Controller auf registered_by_person_id gemappt
    user_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "User-ID ist erforderlich.",
            "string.guid": "User-ID muss eine gültige UUID sein.",
        }),

    // ===============================
    // 🪪 Optionale Staffel (Kopf)
    // ===============================
    squadron_id: Joi.string()
        .guid({ version: "uuidv4" })
        .allow(null)
        .optional()
        .messages({
            "string.guid": "Squadron-ID muss eine gültige UUID sein.",
        }),

    // ===============================
    // 📞 Kopf-Felder
    // ===============================
    phone_number: Joi.string().max(50).allow("", null),
    license_plate: Joi.string().max(20).allow("", null),
    start_number: Joi.string().max(20).allow("", null),

    wishes: Joi.string().max(255).allow("", null),
    club: Joi.string().max(120).allow("", null),

    // ===============================
    // 📌 Status
    // ===============================
    status: Joi.string()
        .valid("In Bearbeitung", "bestätigt", "abgelehnt")
        .default("In Bearbeitung")
        .messages({
            "any.only": "Status muss 'In Bearbeitung', 'bestätigt' oder 'abgelehnt' sein.",
        }),

    // ===============================
    // ⚠️ WICHTIG
    // ===============================
    // Teilnehmer-Daten (participants[])
    // werden NICHT hier validiert!
    // -> event_registration_participant
});

module.exports = eventRegistrationSchema;
