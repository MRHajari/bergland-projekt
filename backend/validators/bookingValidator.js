const Joi = require("joi");

const bookingSchema = Joi.object({
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref("start_date")).required(),
    person_id: Joi.number().integer().required(),
    accommodation_id: Joi.number().integer().required()
});

module.exports = bookingSchema;
