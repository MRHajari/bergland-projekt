const Joi = require("joi");

const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

const createRuntimeSchema = Joi.object({
    participant_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required(),

    registration_id: Joi.string()
        .guid({ version: "uuidv4" })
        .optional(),

    event_route_id: Joi.string()
        .guid({ version: "uuidv4" })
        .optional(),

    route_id: Joi.string()
        .guid({ version: "uuidv4" })
        .optional(),

    start_time: Joi.string()
        .pattern(timePattern)
        .required(),

    finish_time: Joi.string()
        .pattern(timePattern)
        .allow(null, "")
        .optional(),

    split_time: Joi.string()
        .pattern(timePattern)
        .allow(null, "")
        .optional(),
}).or("event_route_id", "route_id");

const updateRuntimeSchema = Joi.object({
    start_time: Joi.string()
        .pattern(timePattern)
        .allow(null, "")
        .optional(),

    finish_time: Joi.string()
        .pattern(timePattern)
        .allow(null, "")
        .optional(),

    split_time: Joi.string()
        .pattern(timePattern)
        .allow(null, "")
        .optional(),
}).min(1);

module.exports = {
    createRuntimeSchema,
    updateRuntimeSchema,
};