const Joi = require("joi");

const userSchema = Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    birth_date: Joi.date().required(),
});

module.exports = userSchema;
