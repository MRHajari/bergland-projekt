const Joi = require("joi");

const registrationSchema = Joi.object({
    vorname: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Vorname darf nicht leer sein.",
            "string.min": "Vorname muss mindestens 2 Zeichen lang sein.",
            "any.required": "Vorname ist erforderlich.",
        }),

    nachname: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Nachname darf nicht leer sein.",
            "string.min": "Nachname muss mindestens 2 Zeichen lang sein.",
            "any.required": "Nachname ist erforderlich.",
        }),

    geburtsdatum: Joi.date()
        .less("now")
        .optional()
        .messages({
            "date.less": "Geburtsdatum muss in der Vergangenheit liegen.",
            "date.base": "Geburtsdatum muss ein gültiges Datum sein.",
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Bitte gib eine gültige E-Mail-Adresse ein.",
            "any.required": "E-Mail ist erforderlich.",
        }),
});

module.exports = registrationSchema;
