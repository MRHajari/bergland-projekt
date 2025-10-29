// backend/validators/eventValidator.js
const Joi = require("joi");

// ============================================================
// ➕ CREATE Validator
// ============================================================
exports.validateEvent = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        description: Joi.string().allow("", null).max(1000),
        start_date: Joi.date().required(),
        end_date: Joi.date().min(Joi.ref("start_date")).required(),
        registration_deadline: Joi.date().min("now").required(),
    });
    return schema.validate(data, { abortEarly: false });
};

// ============================================================
// ✏️ UPDATE Validator
// ============================================================
exports.validateEventUpdate = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(255).optional(),
        description: Joi.string().allow("", null).max(1000).optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().min(Joi.ref("start_date")).optional(),
        registration_deadline: Joi.date().optional(), // ✅ kein .min("now")
    });
    return schema.validate(data, { abortEarly: false });
};


