const Joi = require("joi");

// ============================================================
// 🔹 Registrierung
// ============================================================
exports.registerSchema = Joi.object({
    first_name: Joi.string().min(2).max(100).required(),
    last_name: Joi.string().min(2).max(100).required(),
    birth_date: Joi.date().optional(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
        .message("Passwort muss Groß-, Kleinbuchstaben und Zahlen enthalten")
        .required(),
});

// ============================================================
// 🔹 Login
// ============================================================
exports.loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});
