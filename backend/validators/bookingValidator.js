const Joi = require("joi");

/**
 * ✅ Booking Validator
 * Gültig für das neue Zimmermodell:
 * 1, 2, 4, 5, 6 Bett-Zimmer
 */

// ============================================================
// ➕ Create Booking
// ============================================================
const bookingSchema = Joi.object({
    event_registration_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "event_registration_id ist erforderlich.",
            "string.guid": "event_registration_id muss eine gültige UUIDv4 sein.",
        }),

    accommodation_id: Joi.string()
        .guid({ version: "uuidv4" })
        .required()
        .messages({
            "any.required": "accommodation_id ist erforderlich.",
            "string.guid": "accommodation_id muss eine gültige UUIDv4 sein.",
        }),

    single_beds: Joi.number().integer().min(0).default(0),
    double_beds: Joi.number().integer().min(0).default(0),
    quad_beds: Joi.number().integer().min(0).default(0),
    quint_beds: Joi.number().integer().min(0).default(0),
    sext_beds: Joi.number().integer().min(0).default(0),
})
    .custom((value, helpers) => {
        const total =
            value.single_beds +
            value.double_beds +
            value.quad_beds +
            value.quint_beds +
            value.sext_beds;

        if (total === 0) {
            return helpers.error("any.custom", {
                message: "Mindestens ein Zimmer muss gebucht werden.",
            });
        }

        return value;
    }, "Mindestens ein Zimmer prüfen");

// ============================================================
// ✏️ Update Booking
// ============================================================
const bookingUpdateSchema = Joi.object({
    single_beds: Joi.number().integer().min(0),
    double_beds: Joi.number().integer().min(0),
    quad_beds: Joi.number().integer().min(0),
    quint_beds: Joi.number().integer().min(0),
    sext_beds: Joi.number().integer().min(0),
})
    .min(1)
    .messages({
        "object.min": "Mindestens ein Feld muss aktualisiert werden.",
    });

module.exports = { bookingSchema, bookingUpdateSchema };
