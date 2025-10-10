const Joi = require("joi");

const squadronSchema = Joi.object({
    event_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
    name: Joi.string().min(2).max(120).required(),
    start_number: Joi.string().max(50).allow("", null),
    members_count: Joi.number().integer().min(1).max(100).default(1),
    description: Joi.string().allow("", null),
});

module.exports = squadronSchema;
