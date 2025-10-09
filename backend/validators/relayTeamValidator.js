// backend/validators/relayTeamValidator.js
const Joi = require("joi");

const relayTeamSchema = Joi.object({
    event_id: Joi.string().guid({ version: "uuidv4" }).required(),
    route_id: Joi.string().guid({ version: "uuidv4" }).required(),
    run_date: Joi.date().required(),

    start_time: Joi.string().pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/).allow(null, ""),
    start_location: Joi.string().max(180).allow(null, ""),
    notes: Joi.string().allow(null, ""),
});

module.exports = relayTeamSchema;
