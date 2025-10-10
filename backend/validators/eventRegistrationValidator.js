const Joi = require("joi");

/**
 * 🧾 EventRegistration Validator
 * Validiert Anmeldedaten einer Person zu einem Event.
 * - Eine Person darf pro Event nur einmal vorkommen (Prüfung im Controller)
 * - squadron_id ist optional
 */
const eventRegistrationSchema = Joi.object({
    // IDs
    event_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "Event-ID ist erforderlich.",
            "string.guid": "Event-ID muss eine gültige UUID sein.",
        }),

    person_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "Person-ID ist erforderlich.",
            "string.guid": "Person-ID muss eine gültige UUID sein.",
        }),

    squadron_id: Joi.string()
        .guid({ version: "uuidv4" })
        .allow(null)
        .optional()
        .messages({
            "string.guid": "Squadron-ID muss eine gültige UUID sein.",
        }),

    // Teilnehmerdaten
    phone_number: Joi.string().max(50).allow("", null),
    license_plate: Joi.string().max(20).allow("", null),

    participation_type: Joi.string()
        .valid("einzeln", "staffel")
        .required()
        .messages({
            "any.only": "Teilnahmeart muss 'einzeln' oder 'staffel' sein.",
        }),

    catering_type: Joi.string().max(100).allow("", null),
    wishes: Joi.string().max(255).allow("", null),

    gender: Joi.string().valid("m", "w", "d").allow(null),
    club: Joi.string().max(120).allow("", null),
    start_number: Joi.string().max(20).allow("", null),

    liability_accept: Joi.boolean().required().messages({
        "any.required": "Haftungserklärung muss bestätigt werden.",
    }),

    status: Joi.string()
        .valid("in_auswahl", "bestätigt", "abgelehnt")
        .default("in_auswahl")
        .messages({
            "any.only":
                "Status muss 'in_auswahl', 'bestätigt' oder 'abgelehnt' sein.",
        }),
});

module.exports = eventRegistrationSchema;
