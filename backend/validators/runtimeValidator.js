const Joi = require("joi");

exports.runtimeSchema = Joi.object({
    event_registration_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required(),

    route_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required(),

    duration_seconds: Joi.number()
        .integer()
        .min(1)
        .required(),

    position: Joi.number()
        .integer()
        .min(1)
        .optional(),
});
