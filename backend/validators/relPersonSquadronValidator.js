const Joi = require("joi");

const relPersonSquadronSchema = Joi.object({
    person_id: Joi.string().guid({ version: "uuidv4" }).required(),
    squadron_id: Joi.string().guid({ version: "uuidv4" }).required(),
    note: Joi.string().max(255).allow("", null),
});

module.exports = relPersonSquadronSchema;
