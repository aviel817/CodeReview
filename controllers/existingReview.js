const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
const date = require('date-and-time');
const Review = require('../models/review');
const CommentFile = require('../models/commentFile');
const User = require('../models/user');
const sanitizeHtml = require('sanitize-html');
const upload = require('../middlewares/upload');
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

router.get('/:id', isAuth, async function (req, res) {
    const userID = req.session.userID;
    const notifications = await queries.getNotifications(userID);
    const getVarID = req.params.id;
    var revTitle = "";
    var paramList = [];
    const existingReviewPath = path.join(__dirname + "/../views/existingreview.ejs");
    if (mongoose.Types.ObjectId.isValid(getVarID))
    {
        const review = await queries.getReviewByID(getVarID);
        if (review)
        {
            revTitle = review.reviewtitle;
            const authorID = review.authorID;
            const projectName = review.project;
            const files = review.files;

            var uploaderUser = await queries.getUserByID(authorID);
            if (!uploaderUser)
            {
                authorName = "Not Found";
            }
            else {
                authorName = uploaderUser.username;
            }

            const assignedReviewers_ids = review.assignedReviewers;
            const assignedReviewers_names = [];
            const assignedReviewers_votes = [];
            for (let id of assignedReviewers_ids)
            {
                var username = await queries.getUsernameByID(id);
                var review_vote = await Review.aggregate([
                    {
                      '$match': {
                        '_id': mongoose.Types.ObjectId(getVarID)
                      }
                    }, {
                      '$unwind': {
                        'path': '$lastVotes'
                      }
                    }, {
                      '$match': {
                        'lastVotes.userID': mongoose.Types.ObjectId(id)
                      }
                    }, {
                      '$project': {
                        'lastVotes.userVote': 1
                      }
                    }
                  ]);

                if (username)
                {
                    assignedReviewers_names.push(username);
                }
                if (review_vote && review_vote.length > 0)
                {
                    assignedReviewers_votes.push(review_vote[0].lastVotes.userVote);
                } else {
                    assignedReviewers_votes.push("None");
                }
            }

            const revID = getVarID;
            const reviewText = review.text;
            const reviewComments = review.comments;
            const tags = review.tags;
            var userDetails = [];
            var tagsStr = "";
            var user = null;
            for (var i=0; i < reviewComments.length; i++)
            {
                user = await queries.getUserByID(reviewComments[i].userID);
                userDetails.push(user);
            }
            tags.forEach((item)=> {
                tagsStr = tagsStr.concat(" #", item);
            });
            res.render(existingReviewPath,
               {userID, notifications, revID, revTitle, authorName,
                 projectName, assignedReviewers_names, assignedReviewers_votes,
                 reviewText, reviewComments, userDetails, tagsStr, files});
            return;
        }
        /**
        revTitle = "Not Found";
        res.render(existingReviewPath, {revTitle});
        return;
         */
    }
    res.status(404).sendFile(path.join(__dirname + "/../views/404.html"));
    /** 
    revTitle = "error";
    res.render(existingReviewPath, {revTitle});
    */
});

/**
 * Sending new comment
 */
router.post('/:id', urlencodedParser, async(req, res) =>  {  
    const existingReviewPath = path.join(__dirname + "/../views/existingreview.ejs");
    const review = await Review.findOne({_id: req.params.id});
    const userID = req.session.userID;
    const pattern = date.compile('D/MM/YYYY HH:mm:ss');
    const cleanComment = sanitizeHtml(req.body.commentText, {
    allowedTags: [ 'pre', 'code']
    });

    const comment = {
        userID: mongoose.Types.ObjectId(userID),
        date: date.format(new Date(), pattern),
        content: cleanComment,
        vote: req.body.radioRate
    };


    const updatedReview = await Review.findOneAndUpdate(
        {_id: mongoose.Types.ObjectId(review._id)},
        { $push : {comments: comment}},
    );

    
    const totalComments = await dataFuncs.countComments(userID);

    if (totalComments === 1)
    {
        const badge = {
            name: "First timer",
            amount: 1,
            Rank: "Bronze"
        };
        await User.findOneAndUpdate(
            {_id: userID},
            { $push : {recievedBadges: badge},
              $inc : {'totalPoints' : 2}}
        );
    }
    await User.findOneAndUpdate({_id: userID}, {$inc : {'totalPoints' : 1}}).exec();
    res.send(updatedReview.comments[updatedReview.comments.length-1]._id);
});

router.post('/:id/uploadFile', urlencodedParser, upload.array('codeFiles'), async(req, res) =>  {  
  console.log(req.files);
  if (req.files.length == 0)
  {
    return res.status(400).send();
  }

  for (var i=0; i < req.files.length; i++)
  {
      var fileData = new Buffer.from(req.files[i].buffer, "base64")
      var pattern = date.compile('D/MM/YYYY HH:mm:ss');
      var file = {
          name: req.files[i].originalname,
          uploadDate: date.format(new Date(), pattern),
          data: fileData,
          reviewID: req.params.id,
          commentID: req.body.commentID
      };
  
      CommentFile.create(file, (err) => { console.log(err); });    
  }
  
  res.send(req.params.id);
});


router.post('/:id/removeReviewer', urlencodedParser, async(req, res) =>  {  
    //const existingReviewPath = path.join(__dirname + "/../views/existingreview.ejs");
    let result = req.body.content.trim();
    result = result.replace(/\s+/g, " ");
    const userName = result.split(" ")[0];
    console.log(userName);
    const user = await queries.getUserByName(userName);
    console.log(user);
    Review.updateOne({_id: mongoose.Types.ObjectId(req.params.id)},
                     {$pull: {'assignedReviewers': user._id}}).exec();
    res.redirect('/existingreview/'+req.params.id);
});


router.post('/:id/changeCode', urlencodedParser, async(req, res) =>  {  
    console.log("request to change code sent");
    console.log(req.body.code);
    res.redirect('/existingreview/'+req.params.id);
});




module.exports = router;