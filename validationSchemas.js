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

module.exports.areaSchema = Joi.object({
    area: Joi.object({
        name: Joi.string().required(),
        code: Joi.string().required(),
        color: Joi.string().required(),
        quickInfo: Joi.string(),
        'General Information': Joi.array(),
        'Area-Specific': Joi.array()
    }).required()
});