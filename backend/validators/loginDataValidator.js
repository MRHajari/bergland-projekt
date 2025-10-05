const Joi = require("joi");

module.exports = Joi.object({
    person_id: Joi.string().uuid().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("user", "admin").default("user"),
});
