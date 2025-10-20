const Joi = require("joi");

/**
 * 🧾 EventRegistration Validator
 * Validiert Anmeldedaten einer Person zu einem Event.
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

    user_id: Joi.string() // 🟢 geändert von person_id → user_id
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "User-ID ist erforderlich.",
            "string.guid": "User-ID muss eine gültige UUID sein.",
        }),

    squadron_id: Joi.string()
        .guid({ version: "uuidv4" })
        .allow(null)
        .optional()
        .messages({
            "string.guid": "Squadron-ID muss eine gültige UUID sein.",
        }),

    phone_number: Joi.string().max(50).allow("", null),
    license_plate: Joi.string().max(20).allow("", null),

    participation_type: Joi.string()
        .valid("einzeln", "staffel")
        .allow(null),

    catering_type: Joi.string().max(100).allow("", null),
    wishes: Joi.string().max(255).allow("", null),

    gender: Joi.string().valid("m", "w", "d").allow(null),
    club: Joi.string().max(120).allow("", null),
    start_number: Joi.string().max(20).allow("", null),

    liability_accept: Joi.boolean().allow(null),

    status: Joi.string()
        .valid("in_auswahl", "bestätigt", "abgelehnt")
        .default("in_auswahl")
        .messages({
            "any.only": "Status muss 'in_auswahl', 'bestätigt' oder 'abgelehnt' sein.",
        }),
});

module.exports = eventRegistrationSchema;
