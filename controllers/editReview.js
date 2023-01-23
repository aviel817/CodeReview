const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
const date = require('date-and-time');
const Review = require('../models/review');
const User = require('../models/user');
const Notification = require('../models/notification');
const queries = require('./queries');
const dataFuncs = require('./dataFuncs');


var urlencodedParser = bodyParser.urlencoded({ extended: true });

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/:id/edit', isAuth, async function (req, res) {
    //check permission
    const editReviewPath = path.join(__dirname + "/../views/editReview.ejs");
    const userID = req.session.userID;
    const notifications = await queries.getNotifications(userID);
    const revID = req.params.id;
    const review = await queries.getReviewByID(revID);
    const reviewTitle = review.reviewtitle;
    const reviewDescription = review.text;
    const assignedReviewers_ids = review.assignedReviewers;
    const assignedReviewers_names = [];
    for (let id of assignedReviewers_ids)
    {
        var username = await queries.getUsernameByID(id);
        assignedReviewers_names.push(username);
    }
    const users = await dataFuncs.getReviewersInProject(review.project, revID);
    res.render(editReviewPath, {userID, notifications, reviewDescription, reviewTitle, assignedReviewers_names, revID, users});

});

router.post('/:id/removeReviewer', urlencodedParser, async(req, res) =>  {  
    const userName = req.body.content;
    const user = await queries.getUserByName(userName);
    if (user)
    {
      Review.updateOne({_id: mongoose.Types.ObjectId(req.params.id)},
                       {$pull: {'assignedReviewers': user._id}}).exec();
      return res.status(200).send(userName + ' removed from reviewers list');
    }
    res.status(400).send();
});

router.post('/:id/addReviewer', urlencodedParser, async(req, res) =>  {  
  const userName = req.body.username;
  const user = await queries.getUserByName(userName);
  if (user)
  {
    await Review.updateOne({_id: mongoose.Types.ObjectId(req.params.id)},
    {$push: {'assignedReviewers': user._id}}).exec();
    return res.status(200).send(userName +' added as reviewer');
  }
  res.status(400).send('No reviewer choosed');
});

router.post('/:id/changeDescription', urlencodedParser, async(req, res) =>  {  
    if (req.body.content.length > 0)
    {
      await Review.updateOne({_id: req.params.id},
        {'text': req.body.content});
      return res.status(200).send('description changed');
    }
    res.status(400).send('empty description');

});

router.post('/:id/changeReviewTitle', urlencodedParser, async(req, res) =>  {  
  if (req.body.content.length > 0)
  {
    await Review.updateOne({_id: req.params.id},
      {'reviewtitle': req.body.content});
    return res.status(200).send('review title changed');
  }
  res.status(400).send('New review title is empty!');

});

router.post('/:id/edit/addExpDays', urlencodedParser, async(req, res) =>  {
  const reviewID = req.params.id;
  if (mongoose.Types.ObjectId.isValid(reviewID))
  {
    const pattern = date.compile('D/MM/YYYY HH:mm:ss');
    const daysToAdd = req.body.daysToAdd;
    const review = await queries.getReviewByID(reviewID);
    const expDate = date.parse(review.expirationDate, pattern);
    const newExpDate = date.format(date.addDays(expDate, parseInt(daysToAdd)), pattern);
    
    await Review.updateOne({ _id: reviewID },
                           [
                            { $unset: 'expirationDate' },
                            { $set: { 'expirationDate': newExpDate} }
                           ]);
                           
    return res.send('exp days updated');
  }
  return res.status(400).send();
});




module.exports = router;