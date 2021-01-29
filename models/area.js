const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const areaSchema = new Schema({
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
    cities: {
        type: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City'
        } ],
    },
    'General Information': {},
    'Area-Specific': {}
});

module.exports = mongoose.model('Area', areaSchema);