const Joi = require("joi");

exports.eventRegistrationSchema = Joi.object({
    event_id: Joi.string().uuid().required(),
    person_id: Joi.string().uuid().required(),

    phone_number: Joi.string().allow(null, ""),
    license_plate: Joi.string().allow(null, ""),
    participation_type: Joi.string().valid("einzeln", "staffel").required(),
    catering_type: Joi.string().allow(null, ""),
    wishes: Joi.string().allow(null, ""),
    gender: Joi.string().valid("m", "w", "d").allow(null, ""),
    club: Joi.string().allow(null, ""),
    start_number: Joi.string().allow(null, ""),
    liability_accept: Joi.boolean().default(false),

    status: Joi.string().valid("bestätigt", "in_auswahl", "abgelehnt").allow(null),
    relay_team_id: Joi.string().uuid().allow(null),
});
