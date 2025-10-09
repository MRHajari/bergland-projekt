// backend/validators/eventValidator.js
const Joi = require("joi");

exports.validateEvent = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        description: Joi.string().allow("", null),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        registration_deadline: Joi.date().optional(), // 🟢 neu
    });

    return schema.validate(data, { abortEarly: false });
};
