const Joi = require("joi");

module.exports = Joi.object({
    id_event: Joi.string().uuid().required().messages({
        "string.guid": "Event-ID muss eine gültige UUID sein.",
        "any.required": "Event-ID ist erforderlich.",
    }),
    id_person: Joi.string().uuid().required().messages({
        "string.guid": "Person-ID muss eine gültige UUID sein.",
        "any.required": "Person-ID ist erforderlich.",
    }),
    id_unterkunft: Joi.string().uuid().optional().allow(null),
});
