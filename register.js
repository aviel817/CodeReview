const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
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
    
});

module.exports = router;