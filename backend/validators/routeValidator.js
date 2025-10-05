const Joi = require("joi");

const routeSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    distance_km: Joi.number().positive().required(),
    event_id: Joi.number().integer().required()
});

module.exports = routeSchema;
