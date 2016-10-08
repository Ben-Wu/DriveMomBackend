/**
 * Created by bw964 on 2016-10-08.
 */
var express = require('express');
var router = express.Router();

var TripData = require("../models/tripData");

router.post('/data', function(req, res, next) {
    if(!req.body.userId.isNull || !req.body.tripId || !req.body.data) {
        res.status(400);
        res.send("userId, tripId, and data are required");
        return;
    }
    for(var dataPointNumber = 0 ; dataPointNumber < req.body.data.length ; dataPointNumber++) {
        var dataPoint = {};
        dataPoint.userId = req.body.userId;
        dataPoint.tripId = req.body.tripId;
        dataPoint.value = req.body.data[dataPointNumber].value;
        dataPoint.timestamp = req.body.data[dataPointNumber].timestamp;
        dataPoint.name = req.body.data[dataPointNumber].name;
        TripData.create(dataPoint, function(err, saved) {
            if(err) {
                console.log(err);
            } else {
                console.log("data point saved: " + dataPoint.name);
            }
        })
    }
    res.send("saved data points");
});

module.exports = router;
