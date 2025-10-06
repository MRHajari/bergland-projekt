// backend/validators/belegungValidator.js
const Joi = require("joi");

module.exports = Joi.object({
    id_event: Joi.string().uuid().required().messages({
        "string.guid": "Event-ID muss eine gültige UUID sein.",
        "any.required": "Event-ID ist erforderlich.",
    }),
    id_person: Joi.number().integer().required().messages({
        "any.required": "Person-ID ist erforderlich.",
        "number.base": "Person-ID muss eine Zahl sein.",
    }),
    id_unterkunft: Joi.number().integer().optional().allow(null),
});
