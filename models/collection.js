const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const collectionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    quickInfo: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    locs: {
        type: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location'
        } ],
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    'General Information': {},
    'Collection-Specific': {}
});

module.exports = mongoose.model('Collection', collectionSchema);