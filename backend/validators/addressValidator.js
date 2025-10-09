// backend/validators/addressValidator.js
const Joi = require("joi");

exports.addressSchema = Joi.object({
    street: Joi.string().min(2).max(100).required(),
    postal_code: Joi.string().min(3).max(10).required(),
    city: Joi.string().min(2).max(100).required(),
    country: Joi.string().min(2).max(100).required(),
    person_id: Joi.string().uuid().optional().allow(null),
});
