const Joi = require("joi");

/**
 * Validierung für Person-Daten
 * owner_id ist optional (wird vom eingeloggten Benutzer gesetzt)
 */
exports.personSchema = Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),

    // 🎂 Geburtsdatum (optional)
    birth_date: Joi.date().optional().allow(null),

    // 📧 E-Mail-Adresse (optional)
    email: Joi.string().email().optional().allow(null),

    // ☎️ Telefonnummer (optional)
    phone: Joi.string().optional().allow(null),

    // 🏠 Adresse
    street: Joi.string().max(255).optional().allow(null),
    postal_code: Joi.string().max(20).optional().allow(null),
    city: Joi.string().max(100).optional().allow(null),
    country: Joi.string().max(100).optional().allow(null),

    // ⚧ Geschlecht (neu)
    gender: Joi.string()
        .valid('m', 'w', 'd')
        .optional()
        .allow(null),

    // 🧑‍💼 Besitzer / Ersteller (User)
    owner_id: Joi.string()
        .guid({ version: "uuidv4" })
        .optional()
        .allow(null),
});
