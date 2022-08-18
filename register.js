const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const argon2 = require('argon2');
var bodyParser = require('body-parser')

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    totalPoints: Number,
    projects: [Number],
    permission : Number,
    email: String
}, {
    collection: 'Users'
});

const User = mongoose.model('Users', UserSchema);

router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + "/register.html"));
});
router.post('/', urlencodedParser, async(req, res) =>  {
	console.log(req.body);
    const user = await User.findOne({
        username: req.body.username
    });
    if(user){
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