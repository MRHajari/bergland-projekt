const Joi = require("joi");

const productSchema = Joi.object({
    produkt_name: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
            "string.base": "Produktname muss eine Zeichenkette sein.",
            "string.empty": "Produktname darf nicht leer sein.",
            "string.min": "Produktname muss mindestens {#limit} Zeichen lang sein.",
            "string.max": "Produktname darf höchstens {#limit} Zeichen lang sein.",
            "any.required": "Produktname ist erforderlich.",
        }),

    preis: Joi.number()
        .precision(2)
        .min(0)
        .required()
        .messages({
            "number.base": "Preis muss eine Zahl sein.",
            "number.min": "Preis darf nicht negativ sein.",
            "any.required": "Preis ist erforderlich.",
        }),

    beschreibung: Joi.string()
        .max(500)
        .allow(null, "")
        .messages({
            "string.max": "Beschreibung darf höchstens {#limit} Zeichen lang sein.",
        }),

    gueltig_von: Joi.date()
        .allow(null)
        .messages({
            "date.base": "Gültig-von muss ein gültiges Datum sein.",
        }),

    gueltig_bis: Joi.date()
        .greater(Joi.ref("gueltig_von"))
        .allow(null)
        .messages({
            "date.base": "Gültig-bis muss ein gültiges Datum sein.",
            "date.greater": "Gültig-bis muss nach Gültig-von liegen.",
        }),
});

module.exports = productSchema;
