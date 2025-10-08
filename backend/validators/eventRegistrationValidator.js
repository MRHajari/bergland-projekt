const Joi = require("joi");

exports.eventRegistrationSchema = Joi.object({
    event_id: Joi.string().uuid().required(),
    person_id: Joi.string().uuid().required(),
    phone_number: Joi.string().allow(null, ""),
    license_plate: Joi.string().allow(null, ""),
    participation_type: Joi.string().valid("einzeln", "staffel").required(),
    catering_type: Joi.string().allow(null, ""),
    wishes: Joi.string().allow(null, ""),
    gender: Joi.string().valid("m", "w", "d"),
    club: Joi.string().allow(null, ""),
    start_number: Joi.string().allow(null, ""),
    liability_accept: Joi.boolean().required(),
    status: Joi.string().valid("bestätigt", "in_auswahl", "abgelehnt"),
    relay_team_id: Joi.string().allow(null, ""),
});
