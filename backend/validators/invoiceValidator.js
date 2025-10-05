const Joi = require("joi");

const invoiceSchema = Joi.object({
    invoice_number: Joi.string().required(),
    date: Joi.date().required(),
    person_id: Joi.number().integer().required()
});

module.exports = invoiceSchema;
