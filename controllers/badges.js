const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const User = require('../models/user');
const Review = require('../models/review');
const Notification = require('../models/notification');

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
  const user = await User.findById(mongoose.Types.ObjectId(req.session.userID));
  const userID = req.session.userID;
  const notifications = await Notification.find({receiver: userID, isRead: false});


	res.render(path.join(__dirname + "/../views/badges.ejs"), {notifications, userID});
});


module.exports = router;