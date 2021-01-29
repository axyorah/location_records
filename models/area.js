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
    info: {
        type: mongoose.Schema.Types.ObjectId,        
    },
    cities: {
        type: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'City'
        } ],
    },
    general: {},
    'area-specific': {}
});

module.exports = mongoose.model('Area', areaSchema);