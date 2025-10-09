// backend/validators/eventRegistrationValidator.js
const Joi = require("joi");

const eventRegistrationSchema = Joi.object({
    event_id: Joi.string().guid({ version: "uuidv4" }).required(),
    person_id: Joi.string().guid({ version: "uuidv4" }).required(),

    squadron_id: Joi.string().guid({ version: "uuidv4" }).allow(null),
    relay_team_id: Joi.string().guid({ version: "uuidv4" }).allow(null),

    phone_number: Joi.string().max(50).allow(null, ""),
    license_plate: Joi.string().max(20).allow(null, ""),

    participation_type: Joi.string().valid("einzeln", "staffel").required(),
    catering_type: Joi.string().max(100).allow(null, ""),
    wishes: Joi.string().max(255).allow(null, ""),
    gender: Joi.string().valid("m", "w", "d").allow(null, ""),
    club: Joi.string().max(120).allow(null, ""),
    start_number: Joi.string().max(20).allow(null, ""),

    liability_accept: Joi.boolean().required(),
    status: Joi.string().valid("in_auswahl", "bestätigt", "abgelehnt").default("in_auswahl"),
});

module.exports = eventRegistrationSchema;
