const Joi = require("joi");

const runtimeSchema = Joi.object({
    duration: Joi.string().required(),
    registration_id: Joi.number().integer().required()
});

module.exports = runtimeSchema;
