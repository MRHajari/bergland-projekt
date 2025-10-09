// backend/validators/routeValidator.js
const Joi = require("joi");

const routeSchema = Joi.object({
    event_id: Joi.string().guid({ version: "uuidv4" }).required(),

    name: Joi.string().min(2).max(180).required(),

    start_point: Joi.string().max(180).allow("", null),
    end_point: Joi.string().max(180).allow("", null),

    length_km: Joi.number().positive().precision(2).allow(null),
    elevation_m: Joi.number().integer().min(0).allow(null),

    description: Joi.string().allow("", null),
});

module.exports = routeSchema;
