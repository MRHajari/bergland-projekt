const Joi = require("joi");

exports.userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).optional(), // required bei POST, optional bei PUT
    role: Joi.string().valid("user", "admin").default("user"),
    person_id: Joi.string().uuid().optional(),
});
