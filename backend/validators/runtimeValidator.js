const Joi = require("joi");

const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
const runtimeStatusValues = ["did_not_start", "did_not_finish"];

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

    status: Joi.string()
        .valid(...runtimeStatusValues)
        .allow(null)
        .optional(),

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
}).or("event_route_id", "route_id");

const updateRuntimeSchema = Joi.object({
    status: Joi.string()
        .valid(...runtimeStatusValues)
        .allow(null)
        .optional(),

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