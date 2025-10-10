const Joi = require("joi");

exports.runtimeSchema = Joi.object({
    event_registration_id: Joi.string().guid({ version: "uuidv4" }).required(),
    person_id: Joi.string().guid({ version: "uuidv4" }).required(),
    route_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
    start_time: Joi.date().allow(null),
    end_time: Joi.date().allow(null),
    total_time: Joi.string().max(20).allow("", null),
    position: Joi.number().integer().min(1).allow(null),
    distance: Joi.number().positive().allow(null),
});
