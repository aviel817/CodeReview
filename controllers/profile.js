const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const User = require('../models/user');
const Review = require('../models/review');

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/:id', isAuth, async function (req, res) {
  const user = await User.findById(mongoose.Types.ObjectId(req.session.userID));
  const userID = req.session.userID;

  const badges = [0, 0, 0];
  user.recievedBadges.map((badge, i) => {
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
  const numOfReviewsCreated = await Review.countDocuments({authorID: mongoose.Types.ObjectId(req.params.id)});
  const reviewsParticipated = await Review.countDocuments({assignedReviewers: mongoose.Types.ObjectId(req.params.id)});
  //const numOfComments = await Review.countDocuments({})
	res.render(path.join(__dirname + "/../views/profile.ejs"), {user, badges, numOfReviewsCreated, reviewsParticipated, userID});
});


module.exports = router;