const Joi = require('joi');

module.exports.locationSchema = Joi.object({
    location: Joi.object({
        name: Joi.string().required(),
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        code: Joi.string().required(),
        coll: Joi.string().required(),
        quickInfo: Joi.string(),
        'General Information': Joi.array(),
        'Location-Specific': Joi.array()
    }).required()
});

module.exports.collectionSchema = Joi.object({
    collection: Joi.object({
        name: Joi.string().required(),
        code: Joi.string().required(),
        color: Joi.string().required(),
        quickInfo: Joi.string(),
        'General Information': Joi.array(),
        'Collection-Specific': Joi.array()
    }).required()
});