const Joi = require("joi");

module.exports = Joi.object({
    unterkunft_name: Joi.string().required(),
    strasse_hausnr: Joi.string().allow(null, ""),
    plz: Joi.string().allow(null, ""),
    ort: Joi.string().allow(null, ""),
    anz_ez: Joi.number().integer().min(0).default(0),
    anz_dz: Joi.number().integer().min(0).default(0),
    anz_mbz: Joi.number().integer().min(0).default(0),
    anz_betten_mbz: Joi.number().integer().min(0).default(0),
});
