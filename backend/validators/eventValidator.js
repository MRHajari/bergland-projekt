const Joi = require("joi");

const eventSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().allow("", null).optional(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref("start_date")).required()
});

module.exports = eventSchema;
