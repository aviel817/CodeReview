const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const User = require('../models/user');
const Review = require('../models/review');
const Notification = require('../models/notification');
const Project = require('../models/project');

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
  const user = await User.findById(mongoose.Types.ObjectId(viewingID)).exec();
  const userID = req.session.userID;
  const notifications = await Notification.find({receiver: userID, isRead: false});

  const badges = [0, 0, 0];
  console.log(user);
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
  const numOfReviewsCreated = await Review.countDocuments({authorID: mongoose.Types.ObjectId(viewingID)});
  const reviewsParticipated = await Review.countDocuments({assignedReviewers: mongoose.Types.ObjectId(viewingID)});

  const commentsCountQuery = await Review.aggregate([
    [
      {
        '$match': {
          'comments.userID': mongoose.Types.ObjectId(viewingID)
        }
      }, {
        '$unwind': {
          'path': '$comments'
        }
      }, {
        '$match': {
          'comments.userID': mongoose.Types.ObjectId(viewingID)
        }
      }, {
        '$project': {
          'comments.userID': 1, 
          'comments.content': 1
        }
      }, {
        '$count': 'commentsCount'
      }
    ]
  ]);

  const numOfComments = commentsCountQuery[0]?.commentsCount || 0;
  const projects = await User.findById(mongoose.Types.ObjectId(viewingID)).then((item) => item.projects);
  const recentlyAssignedRevs = await Review.find({assignedReviewers: mongoose.Types.ObjectId(viewingID)},{_id: 1, reviewtitle: 1, creationDate: 1, status: 1}).limit(10);
  console.log(recentlyAssignedRevs);

	res.render(path.join(__dirname + "/../views/profile.ejs"), {user, userID, notifications, badges, numOfReviewsCreated, reviewsParticipated, numOfComments, projects, recentlyAssignedRevs});
});


module.exports = router;