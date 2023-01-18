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
const commentFile = require('../models/commentFile');
const stream = require('stream');

var urlencodedParser = bodyParser.urlencoded({ extended: true });

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };

async function isManager(userID, projectName)
{
  const managingProjs = await queries.getProjectByProjMgrID(userID);
  for (var k=0; k < managingProjs.length; k++)
  {
    if (managingProjs[k].projectName == projectName)
    {
      console.log(managingProjs[k].projectName)
      console.log(projectName)
      return true;
    }
  }
  return false;
}

function isAuthor(userID, authorID)
{
  return userID.equals(authorID);
}

function isReviewer(assignedReviewers_ids, userID)
{
  return assignedReviewers_ids.includes(userID);
}

function isProjectUser(userProjects, projectName)
{
  return userProjects.includes(projectName);
}


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
            const revStatus = review.status;
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
            var commentFilesMap = new Map();
            var tagsStr = "";
            var user = null;
            for (var i=0; i < reviewComments.length; i++)
            {
                user = await queries.getUserByID(reviewComments[i].userID);
                userDetails.push(user);
                var commentFiles = await commentFile.find({commentID: reviewComments[i]._id});
                if (commentFiles.length > 0)
                {
                  commentFilesMap.set(reviewComments[i]._id, commentFiles);
                }
            }
            tags.forEach((item)=> {
                tagsStr = tagsStr.concat(" #", item);
            });
            const userPermission = await queries.getUserPermission(userID);
            const userProjects = await queries.getUserProjects(userID);

            permissions = {
                admin: {'approve': true, 'comment': true, 'vote': true, 'edit': true},
                projectManager: {'approve': true, 'comment': true, 'vote': false, 'edit': true},
                reviewAuthor: {'approve': false, 'comment': true, 'vote': false, 'edit': true},
                reviewer: {'approve': false, 'comment': true, 'vote': true, 'edit': false},
                projectUser: {'approve': false, 'comment': true, 'vote': false, 'edit': false},
                user: {'approve': false, 'comment': false, 'vote': false, 'edit': false}
            }

            permission = permissions.user;

            if (userPermission == 'admin') {
              permission = permissions.admin;
            }
            else if ( (userPermission == 'ProjectManager') && (await isManager(userID, projectName)) ) {
              permission = permissions.projectManager;
            }
            
            if(isAuthor(userID, authorID)) {
              permission.edit = true;
              permission.comment = true;
            }
            if (isReviewer(assignedReviewers_ids, userID)) {
              permission.comment = true;
              permission.vote = true;
            }
            if (isProjectUser(userProjects, projectName)) {
              permission.comment = true;
            }
            
            if (revStatus != 'open')
            {
              permission.vote = false;
              permission.comment = false;
              permission.approve = false;
            }

            res.render(existingReviewPath,
               {userID, notifications, revID, revTitle, authorName,
                 projectName, assignedReviewers_names, assignedReviewers_votes,
                 reviewText, reviewComments, userDetails, tagsStr, files, commentFilesMap,
                 permission, revStatus});
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
        { returnDocument: 'after' }
    );


    const checkIfReviewer = await Review.aggregate([
      {
        '$match': {
          '_id': mongoose.Types.ObjectId(review._id)
        }
      }, {
        '$project': {
          'assignedReviewers': 1
        }
      }, {
        '$match': {
          'assignedReviewers': mongoose.Types.ObjectId(userID)
        }
      }
    ]);

    if (checkIfReviewer.length > 0 && req.body.radioRate != '')
    {
      console.log("is reviewer");
      let updateLastVote = await Review.aggregate([
        {
          '$match': {
            '_id': mongoose.Types.ObjectId(review._id)
          }
        }, {
          '$project': {
            'lastVotes.userID': 1, 
            'lastVotes.userVote': 1
          }
        }, {
          '$unwind': {
            'path': '$lastVotes'
          }
        }, {
          '$match': {
            'lastVotes.userID': mongoose.Types.ObjectId(userID)
          }
        }
      ]);

      if (updateLastVote.length === 0)
      {
        console.log("last vote not exist - pushing")
        const lastVote = {
          userID: userID,
          userVote: req.body.radioRate
        }
        await Review.findOneAndUpdate({_id: mongoose.Types.ObjectId(review._id)},
                                      { $push: {lastVotes: lastVote}});
      } else 
      {
        const updatingUserID = updateLastVote[0].lastVotes.userID;
        await Review.updateOne({_id: mongoose.Types.ObjectId(review._id)},
        [
          { $unset: 'lastVotes.userVote'},
          { $set: { 'lastVotes.userVote': req.body.radioRate }}
        ],
        {arrayFilters: [
         {'lastVotes.userID': updatingUserID}
         ]});
      }
    }

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

/** 
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
*/

router.post('/:id/changeCode', urlencodedParser, async(req, res) =>  {  
    console.log("request to change code sent");
    console.log(req.body.code);
    res.redirect('/existingreview/'+req.params.id);
});

router.post('/:id/approve', urlencodedParser, async(req, res) =>  {
  console.log(req.body);
  const reviewID = req.params.id;
  if (mongoose.Types.ObjectId.isValid(reviewID))
  {
    const review = await queries.getReviewByID(reviewID);
    if (review && req.body.approved === 'true')
    {
      var posVotes = 0;
      for (const reviewVote of review.lastVotes)
      {
        if (parseInt(reviewVote.userVote) > 0)
        {
          posVotes += 1;
        }
      }
      if ((posVotes / review.assignedReviewers.length) > 0.6 )
      {
        await queries.changeStatusToApproved(reviewID);
        return res.send("status changed");
      }
    } 
  }
  return res.status(400).send();
});

router.get('/:id/download/:fileID', async (req, res) => {
  const commentFile = await CommentFile.findById(req.params.fileID);
  if (commentFile)
  {
    const fileContents = Buffer.from(commentFile.data, "base64");

    var readStream = new stream.PassThrough();
    readStream.end(fileContents);
  
    res.set('Content-disposition', 'attachment; filename=' + commentFile.name);
    res.set('Content-Type', 'text/plain');
  
    return readStream.pipe(res);
  }
  else
  {
    return res.status(400);
  }

});


module.exports = router;