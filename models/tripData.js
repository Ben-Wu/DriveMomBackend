/**
 * Created by bw964 on 2016-10-08.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
    userId: Number,
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', UserSchema)