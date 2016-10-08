var express = require('express');
var mongoose = require('mongoose');
var crypto = require("crypto");
var request = require("request");
var router = express.Router();

var User = require("../models/user");

var db = "mongodb://localhost/drivingeval";

mongoose.connect(db);

function hashPassword(password) {
  return crypto.createHash("sha1").update(password).digest("hex");
}

function login(req, res) {
  if(!req.body.username || !req.body.password) {
    res.status(400);
    res.send("username and password are required");
    return;
  }
  console.log("Login: " + req.body.username);

  User.findOne({"username": req.body.username, "password": hashPassword(req.body.password)}).exec(function (err, user) {
    if(!err && user && user != null) {
      console.log("Login success");
      res.send("login success");
    } else {
      console.log("Login failed");
      res.status(401);
      res.send("invalid credentials");
    }
  });
}

function signUp(req, res) {
  if(!req.body.username || !req.body.password) {
    res.status(400);
    res.send("username and password are required");
    return;
  }
  console.log("Sign up: " + req.body.username);

  User.count().exec(function (err1, allUsers) {
    User.count({"username": req.body.username}).exec(function (err, count) {
      if(!err && count === 0) {
        req.body.userId = allUsers;
        req.body.password = hashPassword(req.body.password);
        User.create(req.body, function(err, res2) {
          if(!err) {
            console.log("sign up success");
            res.send("sign up success");
          } else {
            console.log("sign up failed");
            res.status(400);
            res.send("user may already exist");
          }
        });
      } else {
        console.log("sign up failed");
        res.status(400);
        res.send("user may already exist");
      }
    });
  });
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find().exec(function (err, users) {
    if(!err) {
      console.log("found users");
      res.send(users);
    } else {
      res.status(401);
      console.log("error retrieving users");
      res.send("error retrieving users");
    }
  });
});

router.post('/login', login)

router.post('/', signUp);

module.exports = router;
