const Joi = require("joi");

const bookingSchema = Joi.object({
    accommodation_id: Joi.string().guid({ version: "uuidv4" }).required(),
    event_id: Joi.string().guid({ version: "uuidv4" }).required(),
    person_id: Joi.string().guid({ version: "uuidv4" }).required(),
    single_beds: Joi.number().integer().min(0).default(0),
    double_beds: Joi.number().integer().min(0).default(0),
    multi_beds: Joi.number().integer().min(0).default(0),
});

module.exports = bookingSchema;
