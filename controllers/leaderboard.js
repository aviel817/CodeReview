const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/user');
const queries = require('./queries');

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
	const users = await User.find().sort({totalPoints: -1}).limit(10).exec();
  const userID = req.session.userID;
  const notifications = await queries.getNotifications(userID);
	res.render(path.join(__dirname + "/../views/leaderboard.ejs"), {userID, notifications, users});
});


module.exports = router;