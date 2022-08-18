const express = require('express');
const router = express.Router();
const path = require('path');
const argon2 = require('argon2');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });


router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + "/register.html"));
});
router.post('/', urlencodedParser, async(req, res) =>  {
	console.log(req.body);
    const userName = await User.findOne({
        username: req.body.username
    });
    if(userName){
        res.redirect('/register');
    }
    else{
        const userEmail = await User.findOne({
            email: req.body.email            
        });
        if(userEmail){
            res.redirect('/register');
        }
        else {
            try {
                var hash = await argon2.hash("password");
              } catch (err) {
                console.log("ERROR " + err);
              }   
             new User({
                username: req.body.username,
                password: hash,
                totalPoints: 0,
                projects: [0, 1],
                permission: 0,
                email: req.body.email
            }).save()
            res.redirect('/login');
        }
    }
    
});

module.exports = router;