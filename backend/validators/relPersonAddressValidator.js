// backend/validators/relPersonAddressValidator.js
const Joi = require("joi");

exports.relPersonAddressSchema = Joi.object({
    person_id: Joi.string().uuid().required(),
    address_id: Joi.string().uuid().required(),
    gueltig_bis: Joi.date().optional().allow(null),
});
