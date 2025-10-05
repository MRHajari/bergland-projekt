const Joi = require("joi");

const paymentSchema = Joi.object({
    payment_date: Joi.date().required(),
    amount: Joi.number().positive().required(),
    invoice_id: Joi.number().integer().required()
});

module.exports = paymentSchema;
