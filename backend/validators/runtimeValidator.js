const Joi = require("joi");

exports.runtimeSchema = Joi.object({
    event_registration_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "string.guid": "event_registration_id muss eine gültige UUID sein.",
            "any.required": "event_registration_id ist erforderlich.",
        }),

    event_route_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "string.guid": "event_route_id muss eine gültige UUID sein.",
            "any.required": "event_route_id ist erforderlich.",
        }),

    duration_seconds: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            "number.base": "duration_seconds muss eine Zahl sein.",
            "number.integer": "duration_seconds muss eine ganze Zahl sein.",
            "number.min": "duration_seconds muss größer als 0 sein.",
            "any.required": "duration_seconds ist erforderlich.",
        }),
});
