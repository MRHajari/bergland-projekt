// backend/validators/authValidator.js
const Joi = require("joi");

exports.registerSchema = Joi.object({
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("user", "admin").optional(),
});

exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});
