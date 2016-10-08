/**
 * Created by bw964 on 2016-10-08.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var TripDataSchema = new Schema({
    userId: {
        type: Number,
        required: true
    },
    tripId: {
        type: Number,
        required: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('TripData', TripDataSchema);