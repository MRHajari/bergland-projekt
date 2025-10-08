const Joi = require("joi");

exports.personSchema = Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    birth_date: Joi.date().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
});
