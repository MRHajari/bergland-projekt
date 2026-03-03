const Joi = require("joi");

const createRuntimeSchema = Joi.object({
    participant_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required(),

    event_route_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required(),

    duration_seconds: Joi.number()
        .integer()
        .min(1)
        .required(),
});

const updateRuntimeSchema = Joi.object({
    duration_seconds: Joi.number()
        .integer()
        .min(1)
        .required(),
});

module.exports = {
    createRuntimeSchema,
    updateRuntimeSchema,
};