const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const Review = require('../models/review');
const User = require('../models/user');
var bodyParser = require('body-parser');
const dataFuncs = require('./dataFuncs');
const queries = require('./queries');
const argon2 = require('argon2');
const validator = require("email-validator");

var urlencodedParser = bodyParser.urlencoded({ extended: true });


const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };

const checkPermission = async (req, res, next) => {
  const userID = req.session.userID;
  const userPermission = await queries.getUserPermission(userID);
  if (userPermission != 'admin' && userID != req.params.id)
  {
      return res.redirect('/');
  }
  next();
};

const showEdit = async (userID, reqID) => {
  const userPermission = await queries.getUserPermission(userID);
  if (userPermission != 'admin' && userID != reqID)
  {
      return false;
  }
  return true;
};

router.get('/:id', isAuth, async function (req, res) {
  const viewingProfileID = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(viewingProfileID))
  {
    return res.redirect('/404');
  }
  const user = await queries.getUserByID(viewingProfileID);
  const userID = req.session.userID;
  const notifications = await queries.getNotifications(userID);

  const badges = [0, 0, 0];
  
  if (!user)
  {
    return res.redirect('/404');
  }

  user?.recievedBadges.map((badge, i) => {
    if(badge.Rank === 'Bronze')
    {
      badges[0] += badge.amount;
    }
    else if (badge.Rank === 'Silver')
    {
      badges[1] += badge.amount;
    }
    else if (badge.Rank === 'Gold')
    {
      badges[2] += badge.amount;
    }
  });
  const numOfReviewsCreated = await dataFuncs.countReviewsCreated(viewingProfileID);
  const reviewsParticipated = await dataFuncs.countReviewsParticipated(viewingProfileID);
  const numOfComments = await dataFuncs.countComments(viewingProfileID);
  
  const projects = await queries.getUserProjects(viewingProfileID);
  const recentlyAssignedRevs = await Review.find({assignedReviewers: mongoose.Types.ObjectId(viewingProfileID)},{_id: 1, reviewtitle: 1, creationDate: 1, status: 1}).limit(10);
  const showEditPerm = await showEdit(userID, viewingProfileID);
	res.render(path.join(__dirname + "/../views/profile.ejs"), {user, userID, notifications, badges, numOfReviewsCreated, reviewsParticipated, numOfComments, projects, recentlyAssignedRevs, showEditPerm});
});

router.get('/:id/edit', isAuth, checkPermission, async function (req, res) {
  const profileID = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(profileID))
  {
    return res.redirect('/404');
  }
  const user = await queries.getUserByID(profileID);
  const userID = req.session.userID;
  const notifications = await queries.getNotifications(userID);

	res.render(path.join(__dirname + "/../views/editProfile.ejs"), {user, userID, notifications, profileID});
});

router.post('/:id/edit/changePassword', isAuth, checkPermission, urlencodedParser, async(req, res) =>  {  
  const newPassword = req.body.password;
  if (newPassword.length >= 8)
  {
    await User.updateOne({_id: req.params.id},
                         {'password': await argon2.hash(newPassword)});
    return res.status(200).send('password changed');
  }
  res.status(400).send('invalid password, try stronger password');

});

router.post('/:id/edit/changeEmail', isAuth, checkPermission, urlencodedParser, async(req, res) =>  {  
  const newEmail = req.body.email;
  if (validator.validate(newEmail) === true)
  {
    await User.updateOne({_id: req.params.id},
                         {'email': newEmail});
    return res.status(200).send('email changed');
  }
  res.status(400).send('invalid email, try again');

});

module.exports = router;