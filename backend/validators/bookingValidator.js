const Joi = require("joi");

/**
 * ✅ Booking Validator
 * Prüft die Felder für Unterkunftsbuchungen.
 * Buchungen gehören jetzt einem User, nicht einer Person.
 */
const bookingSchema = Joi.object({
    user_id: Joi.string().guid({ version: "uuidv4" }).required(),
    event_id: Joi.string().guid({ version: "uuidv4" }).required(),
    accommodation_id: Joi.string().guid({ version: "uuidv4" }).required(),

    single_beds: Joi.number().integer().min(0).default(0),
    double_beds: Joi.number().integer().min(0).default(0),
    multi_beds: Joi.number().integer().min(0).default(0),
});

module.exports = bookingSchema;
