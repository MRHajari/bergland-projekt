// backend/validators/eventRouteValidator.js
const Joi = require("joi");

const schema = Joi.object({
    event_id: Joi.string()
        .trim()
        .guid({ version: ["uuidv4"] })
        .required(),

    route_id: Joi.string()
        .trim()
        .guid({ version: ["uuidv4"] })
        .required(),

    day_date: Joi.date()
        .iso()
        .allow(null),

    start_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .allow(null),

    note: Joi.string()
        .trim()
        .max(255)
        .allow("", null),
})
    .custom((value, helpers) => {
        // Wenn Zeit gesetzt → Datum Pflicht
        if (value.start_time && !value.day_date) {
            return helpers.message("start_time benötigt day_date");
        }
        return value;
    });

module.exports = schema;
