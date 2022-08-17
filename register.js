const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

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
	return res.render('register.html');
});
router.post('/', function(req, res) {
	console.log(req.body);
    

});