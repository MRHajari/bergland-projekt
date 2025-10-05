const Joi = require("joi");

const personSchema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    birth_date: Joi.date().optional(),
    email: Joi.string().email().required()
});

module.exports = personSchema;
