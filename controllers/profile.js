const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const Review = require('../models/review');

const dataFuncs = require('./dataFuncs');
const queries = require('./queries');

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/:id', isAuth, async function (req, res) {
  const viewingID = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(viewingID))
  {
    return res.redirect('/404');
  }
  const user = await queries.getUserByID(viewingID);
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
  const numOfReviewsCreated = await dataFuncs.countReviewsCreated(viewingID);
  const reviewsParticipated = await dataFuncs.countReviewsParticipated(viewingID);
  const numOfComments = await dataFuncs.countComments(viewingID);
  
  const projects = await queries.getUserProjects(viewingID);
  const recentlyAssignedRevs = await Review.find({assignedReviewers: mongoose.Types.ObjectId(viewingID)},{_id: 1, reviewtitle: 1, creationDate: 1, status: 1}).limit(10);

	res.render(path.join(__dirname + "/../views/profile.ejs"), {user, userID, notifications, badges, numOfReviewsCreated, reviewsParticipated, numOfComments, projects, recentlyAssignedRevs});
});


module.exports = router;