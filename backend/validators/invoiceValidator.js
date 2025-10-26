const Joi = require("joi");

const invoiceSchema = Joi.object({
    rechnungs_nr: Joi.string().required(), // Rechnungsnummer ist Pflicht
    id_person: Joi.number().integer().required(), // Kunde
    datum: Joi.date().optional(), // Standard ist NOW() im Model
    betrag_gesamt: Joi.number().positive().required(), // Summe aller Produkte
    ist_bezahlt: Joi.boolean().optional(), // Admin klickt später
    bezahlt_am: Joi.date().optional() // Nur gesetzt, wenn bezahlt
});

module.exports = invoiceSchema;
