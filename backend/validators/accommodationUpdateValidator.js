const Joi = require("joi");

module.exports = Joi.object({
    name: Joi.string(),
    street: Joi.string().allow("", null),
    postal_code: Joi.string().allow("", null),
    city: Joi.string().allow("", null),
    country: Joi.string().allow("", null),

    single_rooms: Joi.number().integer().min(0),
    double_rooms: Joi.number().integer().min(0),
    quad_rooms: Joi.number().integer().min(0),
    quint_rooms: Joi.number().integer().min(0),
    sext_rooms: Joi.number().integer().min(0),

    total_beds: Joi.number().integer().min(0),
    description: Joi.string().allow("", null),
});
