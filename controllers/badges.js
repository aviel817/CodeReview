const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const User = require('../models/user');
const Review = require('../models/review');
const Badge = require('../models/badge');
const Notification = require('../models/notification');
const queries = require('./queries');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });


const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };

const isAdmin = async (userID) => {
    const userPermission = await queries.getUserPermission(userID);
    if (userPermission != 'admin')
    {
        return false;
    }
    return true;
};  

router.get('/', isAuth, async function (req, res) {
  const user = await User.findById(mongoose.Types.ObjectId(req.session.userID));
  const userID = req.session.userID;
  const notifications = await Notification.find({receiver: userID, isRead: false});

  const allTimeBadges = await Badge.find({type: 'all-time'});
  const reviewProjectBadges = await Badge.find({type: 'review and project'});
  const timedBadges = await Badge.find({type: 'timed'});

  const editPerm = await isAdmin(userID);
	res.render(path.join(__dirname + "/../views/badges.ejs"), {notifications, userID, allTimeBadges, reviewProjectBadges, timedBadges, editPerm});
});


module.exports = router;