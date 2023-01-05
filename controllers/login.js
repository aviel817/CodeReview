const express = require('express');
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const User = require('../models/user');
const expressSession = require("express-session");
const isAuth = require("../auth");

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/', isAuth, (req, res) => {
    res.render(path.join(__dirname + "/../views/login.ejs"));
  });


router.post("/", urlencodedParser, async (req, res) => {
    if (req.body != null)
    {
        console.log(req.body);
        const user = await User.findOne({
            username: req.body.username
        });
        if(user){
            error = ''
            dbPass = user.password;
              try {
                if (await argon2.verify(dbPass, req.body.password)) {
                  // password match
                  console.log("matched");
                  req.session.isAuth = true;
                  req.session.userID = user._id;
                  req.session.username = user.username;
                  res.redirect('/');
                } else {
                  // password did not match
                  console.log("not matched");
                  error = "Password incorrect!";
                  res.render(path.join(__dirname + "/../views/login.ejs"), {error});
                }
              } catch (err) {
                // internal failure
                console.log("ERROR", err);
              }
        }
        else {
              console.log("User doesn't exist!");
              error = "Username doesn't exists!";
              res.render(path.join(__dirname + "/../views/login.ejs"), {error});
        }

    }
});

module.exports = router;

