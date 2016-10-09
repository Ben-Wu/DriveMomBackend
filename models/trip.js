/**
 * Created by bw964 on 2016-10-08.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TripSchema = new Schema({
    userId: {
        type: Number,
        required: true
    },
    tripId: {
        type: Number,
        required: true
    },
    hardAcc: {
        type: Number,
        required: false
    },
    hardBraking: {
        type: String,
        required: false
    },
    sharpTurn: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('Trip', TripSchema);