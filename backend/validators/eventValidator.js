// backend/validators/eventValidator.js
const Joi = require("joi");

/**
 * ✅ Validiert die Daten für ein Event
 * Nutzt Joi, um sicherzustellen, dass Felder korrekt sind
 * und dass end_date >= start_date ist.
 */
exports.validateEvent = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required().messages({
            "string.empty": "Der Eventname darf nicht leer sein.",
            "any.required": "Der Eventname ist erforderlich.",
        }),

        description: Joi.string().allow("", null).max(1000).messages({
            "string.max": "Die Beschreibung darf maximal 1000 Zeichen enthalten.",
        }),

        start_date: Joi.date().required().messages({
            "date.base": "Das Startdatum muss ein gültiges Datum sein.",
            "any.required": "Das Startdatum ist erforderlich.",
        }),

        end_date: Joi.date()
            .required()
            .min(Joi.ref("start_date"))
            .messages({
                "date.min": "Das Enddatum darf nicht vor dem Startdatum liegen.",
                "any.required": "Das Enddatum ist erforderlich.",
            }),

        registration_deadline: Joi.date()
            .min("now")
            .required()
            .messages({
                "date.min": "Der Anmeldeschluss darf nicht in der Vergangenheit liegen.",
                "any.required": "Der Anmeldeschluss ist erforderlich.",
            }),
    });

    return schema.validate(data, { abortEarly: false });
};
