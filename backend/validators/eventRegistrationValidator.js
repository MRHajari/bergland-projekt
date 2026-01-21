const Joi = require("joi");

/**
 * 🧾 EventRegistration Validator (CREATE + UPDATE)
 * - event_id ist NUR beim CREATE Pflicht
 * - Beim UPDATE darf event_id fehlen
 */
const eventRegistrationSchema = Joi.object({
    // ===============================
    // 🆔 IDs
    // ===============================
    event_id: Joi.string()
        .guid({ version: "uuidv4" })
        .when("$isUpdate", {
            is: true,
            then: Joi.optional(),
            otherwise: Joi.required(),
        })
        .messages({
            "any.required": "Event-ID ist erforderlich.",
            "string.guid": "Event-ID muss eine gültige UUID sein.",
        }),

    registered_by_person_id: Joi.string()
        .guid({ version: "uuidv4" })
        .when("$isUpdate", {
            is: true,
            then: Joi.optional(),
            otherwise: Joi.required(),
        })
        .messages({
            "any.required": "Person-ID ist erforderlich.",
            "string.guid": "Person-ID muss eine gültige UUID sein.",
        }),

    // ===============================
    // 🪪 Optionale Staffel (Kopf)
    // ===============================
    squadron_id: Joi.string()
        .guid({ version: "uuidv4" })
        .allow(null)
        .optional(),

    // ===============================
    // 📞 Kopf-Felder
    // ===============================
    phone_number: Joi.string().max(50).allow("", null),
    license_plate: Joi.string().max(20).allow("", null),
    wishes: Joi.string().max(255).allow("", null),
    club: Joi.string().max(120).allow("", null),

    // ===============================
    // 📌 Status
    // ===============================
    status: Joi.string()
        .valid("In Bearbeitung", "bestätigt", "abgelehnt")
        .default("In Bearbeitung"),
});

module.exports = eventRegistrationSchema;
