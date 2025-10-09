// backend/validators/runtimeValidator.js
const Joi = require("joi");

const runtimeSchema = Joi.object({
    registration_id: Joi.string().guid({ version: "uuidv4" }).required(),
    route_id: Joi.string().guid({ version: "uuidv4" }).required(),

    start_time: Joi.date().allow(null),
    end_time: Joi.date().allow(null),
    total_time: Joi.string().max(20).allow("", null),
});

module.exports = runtimeSchema;
