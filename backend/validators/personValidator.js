const Joi = require("joi");

/**
 * Validierung für Person-Daten
 * owner_id ist optional (wird vom eingeloggten Benutzer gesetzt)
 */
exports.personSchema = Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    birth_date: Joi.date().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    street: Joi.string().max(255).optional(),
    postal_code: Joi.string().max(20).optional(),
    city: Joi.string().max(100).optional(),
    country: Joi.string().max(100).optional(),
    owner_id: Joi.string()
        .guid({ version: "uuidv4" })
        .optional()
        .allow(null),
});
