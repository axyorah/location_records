const Joi = require('joi');

module.exports.citySchema = Joi.object({
    city: Joi.object({
        name: Joi.string().required(),
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        code: Joi.string().required(),
        area: Joi.string().required(),
        quickInfo: Joi.string(),
        'General Information': Joi.array(),
        'City-Specific': Joi.array()
    }).required()
});