/**
 * Created by bw964 on 2016-10-08.
 */
var express = require('express');
var router = express.Router();

var TripData = require("../models/tripData");

router.post('/data', function(req, res, next) {
    if(!req.body.userId || !req.body.tripId || !req.body.data) {
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

router.post('/end', function(req, res, next) {
    if(!req.body.userId || !req.body.tripId) {
        res.status(400);
        res.send("userId and tripId are required");
        return;
    }
    // analyze data - hard acceleration/deceleration, gas and brake at the same time, sharp turning at high speed
    TripData.find({"userId": req.body.userId, "tripId": req.body.tripId, "name": "accelerator_pedal_position"},
        {"_id": 0, "value": 1, "timestamp": 1}).sort({timestamp: 1}).exec(function (err, accPedalPoints) {
        if(!err) {
            var lastSpeed = -1;
            for(var i = 0 ; i < accPedalPoints.length ; i++) {
                if(lastSpeed == -1) {
                    lastSpeed = accPedalPoints[i].value;
                    continue;
                }
                if(lastSpeed - accPedalPoints[i].value >= 4) {
                    console.log("Hard acceleration at " + accPedalPoints[i].timestamp);
                }
                lastSpeed = accPedalPoints[i].value;
            }
        }
        res.send("Trip done");
    });
});

module.exports = router;
