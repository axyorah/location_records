const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [ Number ],
            required: true
        }
    },
    quickInfo: {
        type: String,
        required: true
    },
    general: {},
    'city-specific': {}
});

module.exports = mongoose.model('City', citySchema);