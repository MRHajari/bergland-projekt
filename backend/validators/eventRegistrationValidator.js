// backend/validators/eventRegistrationValidator.js
const Joi = require("joi");

exports.eventRegistrationSchema = Joi.object({
    event_id: Joi.string()
        .uuid()
        .required()
        .messages({
            "any.required": "Das Feld 'event_id' ist erforderlich.",
            "string.guid": "Ungültige Event-ID (UUID erwartet).",
        }),

    person_id: Joi.string()
        .uuid()
        .required()
        .messages({
            "any.required": "Das Feld 'person_id' ist erforderlich.",
            "string.guid": "Ungültige Personen-ID (UUID erwartet).",
        }),

    phone_number: Joi.string().allow(null, "").max(30).messages({
        "string.max": "Telefonnummer darf maximal 30 Zeichen haben.",
    }),

    license_plate: Joi.string().allow(null, "").max(15).messages({
        "string.max": "Kennzeichen darf maximal 15 Zeichen haben.",
    }),

    participation_type: Joi.string()
        .valid("einzeln", "staffel")
        .required()
        .messages({
            "any.only": "Teilnahmeart muss 'einzeln' oder 'staffel' sein.",
            "any.required": "Bitte wähle eine Teilnahmeart aus.",
        }),

    catering_type: Joi.string().allow(null, ""),
    wishes: Joi.string().allow(null, "").max(255),
    gender: Joi.string().valid("m", "w", "d").allow(null, ""),
    club: Joi.string().allow(null, "").max(100),
    start_number: Joi.string().allow(null, "").max(20),

    liability_accept: Joi.boolean().required().messages({
        "any.required": "Du musst die Haftungserklärung akzeptieren.",
    }),

    status: Joi.string()
        .valid("bestätigt", "in_auswahl", "abgelehnt")
        .allow(null, "")
        .messages({
            "any.only": "Status muss 'bestätigt', 'in_auswahl' oder 'abgelehnt' sein.",
        }),

    relay_team_id: Joi.string().uuid().allow(null, "").messages({
        "string.guid": "Ungültige Staffel-Team-ID (UUID erwartet).",
    }),
});
