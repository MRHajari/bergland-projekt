const Joi = require("joi");

/**
 * ✅ Booking Validator (aktualisiert)
 * Eine Unterkunftsbuchung gehört jetzt zu einer EventRegistration,
 * nicht mehr direkt zu einem User oder Event.
 */
const bookingSchema = Joi.object({
    event_registration_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "event_registration_id ist erforderlich.",
            "string.guid": "event_registration_id muss ein gültiger UUIDv4 sein.",
        }),

    accommodation_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "accommodation_id ist erforderlich.",
            "string.guid": "accommodation_id muss ein gültiger UUIDv4 sein.",
        }),

    single_beds: Joi.number().integer().min(0).default(0),
    double_beds: Joi.number().integer().min(0).default(0),
    multi_beds: Joi.number().integer().min(0).default(0),
});

module.exports = bookingSchema;
