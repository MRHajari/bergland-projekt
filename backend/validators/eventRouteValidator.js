// backend/validators/eventRouteValidator.js
const Joi = require("joi");

const eventRouteSchema = Joi.object({
    event_id: Joi.string().guid({ version: "uuidv4" }).required(),
    route_id: Joi.string().guid({ version: "uuidv4" }).required(),

    day_date: Joi.date().iso().allow(null),
    start_time: Joi.string().allow("", null),
    note: Joi.string().max(255).allow("", null),
});

module.exports = eventRouteSchema;
