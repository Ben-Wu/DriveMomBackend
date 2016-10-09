/**
 * Created by bw964 on 2016-10-08.
 */
var express = require('express');
var router = express.Router();

var TripData = require("../models/tripData");
var Trip = require("../models/trip");

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
    res.json({dataPointsSaved: req.body.data.length});
});

router.post('/end', function(req, res, next) {
    if(!req.body.userId || !req.body.tripId) {
        res.status(400);
        res.json({error: "userId and tripId are required"});
        return;
    }
    // analyze data - hard acceleration/deceleration, sharp turning at high speed
    analyzeAcceleration(req, {}, res);
});

function analyzeAcceleration(req, body, res) {
    TripData.find({"userId": req.body.userId, "tripId": req.body.tripId, "name": "accelerator_pedal_position"},
        {"_id": 0, "value": 1, "timestamp": 1}).sort({timestamp: 1}).exec(function (err, accPedalPoints) {
        if(!err) {
            var hardAccs = 0;
            var lastSpeed = -1;
            var duration = accPedalPoints[accPedalPoints.length-1].timestamp - accPedalPoints[0].timestamp;
            for(var i = 0 ; i < accPedalPoints.length ; i++) {
                if(lastSpeed == -1) {
                    lastSpeed = accPedalPoints[i].value;
                    continue;
                }
                if(lastSpeed - accPedalPoints[i].value >= 4) {
                    console.log("Hard acceleration at " + accPedalPoints[i].timestamp);
                    ++hardAccs;
                }
                lastSpeed = accPedalPoints[i].value;
            }
            body.userId = req.body.userId;
            body.tripId = req.body.tripId;
            body.hardAccs = hardAccs;
            body.duration = duration;
            analyzeBraking(req, body, res);
        } else {
            res.json({error: "Error processing trip"});
        }
    });
}

// turning and braking
function analyzeBraking(req, body, res) {
    TripData.find({$or:[{"name": "steering_wheel_angle", "userId": req.body.userId, "tripId": req.body.tripId},
            {"userId": req.body.userId, "tripId": req.body.tripId, "name": "vehicle_speed"}]}).sort({timestamp: 1}).exec(function (err, dataPoint) {
        if(!err) {
            var sharpTurns = 0;
            var hardBrakes = 0;
            var lastSpeed = -1;
            for(var i = 0 ; i < dataPoint.length ; i++) {
                if(lastSpeed == -1 && dataPoint[i].name == "vehicle_speed") {
                    lastSpeed = dataPoint[i].value;
                    continue;
                }
                if(dataPoint[i].name == "vehicle_speed" && dataPoint[i].value - lastSpeed >= 7) {
                    console.log("Hard brake at " + dataPoint[i].timestamp);
                    ++hardBrakes;
                } else if(lastSpeed > 30 && Math.abs(dataPoint[i].value) > 330) {
                    console.log("Sharp turn at " + dataPoint[i].timestamp);
                    ++sharpTurns;
                }
                if(dataPoint[i].name == "vehicle_speed") {
                    lastSpeed = dataPoint[i].value;
                }
            }
            body.sharpTurns = sharpTurns;
            body.hardBrakes = hardBrakes;
            body.score = 100 / ((200 * body.hardBrakes + 30 * body.sharpTurns + 140 * body.hardAccs) / body.duration);
            res.json(body);
            Trip.create(body, function (err, saved) {
                if(!err) {
                    console.log("Trip saved");
                } else {
                    console.log("Error saving trip");
                }
            })
        } else {
            res.json({error: "Error processing trip"});
        }
    });
}

module.exports = router;
