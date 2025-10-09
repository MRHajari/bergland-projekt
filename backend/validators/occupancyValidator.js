const Joi = require("joi");

const occupancySchema = Joi.object({
    accommodation_id: Joi.string().guid({ version: "uuidv4" }).required(),
    event_id: Joi.string().guid({ version: "uuidv4" }).required(),

    single_beds_total: Joi.number().integer().min(0).default(0),
    double_beds_total: Joi.number().integer().min(0).default(0),
    multi_beds_total: Joi.number().integer().min(0).default(0),

    single_beds_booked: Joi.number().integer().min(0).default(0),
    double_beds_booked: Joi.number().integer().min(0).default(0),
    multi_beds_booked: Joi.number().integer().min(0).default(0),
});

module.exports = occupancySchema;
