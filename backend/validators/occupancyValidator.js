// backend/validators/occupancyValidator.js
const Joi = require("joi");

const occupancySchema = Joi.object({
    // 🔗 Beziehungen
    accommodation_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "accommodation_id ist erforderlich.",
            "string.guid": "accommodation_id muss eine gültige UUID sein.",
        }),

    event_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "event_id ist erforderlich.",
            "string.guid": "event_id muss eine gültige UUID sein.",
        }),

    // 🛏️ Gesamtkapazitäten
    single_rooms_total: Joi.number().integer().min(0),
    double_rooms_total: Joi.number().integer().min(0),
    quad_rooms_total: Joi.number().integer().min(0),
    quint_rooms_total: Joi.number().integer().min(0),
    sext_rooms_total: Joi.number().integer().min(0),
});

module.exports = occupancySchema;
