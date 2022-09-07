const express = require('express');
const router = express.Router();
const path = require('path');
const argon2 = require('argon2');
var bodyParser = require('body-parser');
var validator = require("email-validator");
const mongoose = require('mongoose');
const User = require('../models/user');
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });


router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + "/register.html"));
});
router.post('/', urlencodedParser, async(req, res) =>  {
    
	console.log(req.body);
    if(validator.validate(req.body.email)=== false){
        res.send('email address not valid');
    }
    else{
        if(req.body.password.length <8){
            res.send('password too short');
        }
        else{
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
                        var hash = await argon2.hash(req.body.password);
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
                    res.send('You have successfully registered');
                    //  res.redirect('/login');
                }
            }}}    
        });
module.exports = router;