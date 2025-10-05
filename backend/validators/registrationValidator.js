const Joi = require("joi");

const registrationSchema = Joi.object({
    phone_number: Joi.string().pattern(/^[0-9+\- ]{6,15}$/).required(),
    participation_type: Joi.string().valid("runner", "staff", "guest").required(),
    wishes: Joi.string().max(255).optional(),
    person_id: Joi.number().integer().required(),
    event_id: Joi.number().integer().required()
});

module.exports = registrationSchema;
