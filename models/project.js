const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    zoom: {
        type: Number,
        required: true
    },
    mapStyle: {
        type: String,
        enum: ['streets-v11', 'light-v10', 'dark-v10'],
        required: true
    },
    mapUrl: {
        type: String
    },
    token: {
        type: String,
        required: true
    },
    colls: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Collection'
        }]
    }
});

module.exports = mongoose.model('Project', projectSchema);