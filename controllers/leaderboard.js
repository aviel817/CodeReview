const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');

const Review = require('../models/review');
const Project = require('../models/project');
const User = require('../models/user');
const Tag = require('../models/tag');
const date = require('date-and-time');


const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
	const users = await User.find().sort({totalPoints: -1}).limit(10).exec();
	res.render(path.join(__dirname + "/../views/leaderboard.ejs"), {users});
});


module.exports = router;