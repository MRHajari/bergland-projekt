const Joi = require("joi");

const addressSchema = Joi.object({
    street: Joi.string().min(2).max(255).required(),
    city: Joi.string().min(2).max(100).required(),
    postal_code: Joi.string().min(3).max(20).required(),
    country: Joi.string().min(2).max(100).required(),
    personId: Joi.number().integer().optional() // falls Adresse mit Person verknüpft ist
});

module.exports = addressSchema;
