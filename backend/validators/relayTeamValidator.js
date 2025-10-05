const Joi = require("joi");

const relayTeamSchema = Joi.object({
    name: Joi.string().min(2).max(100).required()
});

module.exports = relayTeamSchema;
