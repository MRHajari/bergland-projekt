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
    single_beds_total: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({ "number.base": "single_beds_total muss eine Zahl sein." }),

    double_beds_total: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({ "number.base": "double_beds_total muss eine Zahl sein." }),

    multi_beds_total: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({ "number.base": "multi_beds_total muss eine Zahl sein." }),

    // 📦 aktuelle Belegung
    single_beds_booked: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({ "number.base": "single_beds_booked muss eine Zahl sein." }),

    double_beds_booked: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({ "number.base": "double_beds_booked muss eine Zahl sein." }),

    multi_beds_booked: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({ "number.base": "multi_beds_booked muss eine Zahl sein." }),
});

module.exports = occupancySchema;
