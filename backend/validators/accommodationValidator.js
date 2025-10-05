const Joi = require("joi");

module.exports = Joi.object({
    name: Joi.string().required(),
    street: Joi.string().allow(null, ""),
    postal_code: Joi.string().allow(null, ""),
    city: Joi.string().allow(null, ""),
    country: Joi.string().allow(null, ""),
    single_rooms: Joi.number().integer().min(0).default(0),
    double_rooms: Joi.number().integer().min(0).default(0),
    multi_bed_rooms: Joi.number().integer().min(0).default(0),
    total_beds: Joi.number().integer().min(0).default(0),
});
