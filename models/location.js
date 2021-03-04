const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
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
    coll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    'General Information': {},
    'Location-Specific': {}
});

module.exports = mongoose.model('Location', locationSchema);