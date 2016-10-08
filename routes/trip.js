/**
 * Created by bw964 on 2016-10-08.
 */
var express = require('express');
var router = express.Router();

router.post('/data', function(req, res, next) {
    if(!req.body.userId || !req.body.tripId || !req.body.data) {
        res.send("userId, tripId, and data are required");
    }
    for(var dataPoint = 0 ; dataPoint < req.body.data.length ; dataPoint++) {

    }
});

module.exports = router;
