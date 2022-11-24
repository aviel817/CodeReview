const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
const date = require('date-and-time');
const Review = require('../models/review');
const User = require('../models/user');

function getUserDetails(userID) {
    User.findById(mongoose.Types.ObjectId(userID)).then((user)=>user).catch((err)=>console.log(err));
}

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };

router.get('/:id', isAuth, async function (req, res) {
    //console.log(req.params.id);
    const getVarID = req.params.id;
    var revTitle = "";
    var paramList = [];
    const existingReviewPath = path.join(__dirname + "/../views/existingreview.ejs");
    if (mongoose.Types.ObjectId.isValid(getVarID))
    {
        const review = await Review.findById(mongoose.Types.ObjectId(getVarID));
        if (review)
        {
            revTitle = review.reviewtitle;
            const authorID = review.authorID;
            var uploaderUser = await User.findById(mongoose.Types.ObjectId(authorID));
            if (!uploaderUser)
            {
                authorName = "Not Found";
            }
            else {
                authorName = uploaderUser.username;
            }

            const assignedReviewers = review.assignedReviewers;

            const revID = getVarID;
            const reviewCode = review.code;
            const lastReviewCode = reviewCode[reviewCode.length-1];
            const reviewComments = review.comments;
            const tags = review.tags;
            var userDetails = [];
            var tagsStr = "";
            var user = null;
            for (var i=0; i < reviewComments.length; i++)
            {
                user = await User.findById(mongoose.Types.ObjectId(reviewComments[i].userID));
                userDetails.push(user);
            }
            tags.forEach((item)=> {
                tagsStr = tagsStr.concat(" #", item);
            });
            res.render(existingReviewPath, {revID, revTitle, authorName, assignedReviewers, lastReviewCode, reviewComments, userDetails, tagsStr});
            return;
        }
        revTitle = "Not Found";
        res.render(existingReviewPath, {revTitle});
        return;
    }
    
    
    revTitle = "error";
    res.render(existingReviewPath, {revTitle});

});



router.post('/:id', urlencodedParser, async(req, res) =>  {  
    const existingReviewPath = path.join(__dirname + "/../views/existingreview.ejs");

    const review = await Review.findOne({_id: "632dc94c68daaae3bd3f0080"});
    const pattern = date.compile('D/MM/YYYY HH:mm:ss');
    const comment = {
        userID: mongoose.Types.ObjectId("632dc83468daaae3bd3f0078"),
        date: date.format(new Date(), pattern),
        content: req.body.commentText,
        vote: req.body.radioRate
    };

    await Review.findOneAndUpdate(
        {_id: req.params.id},
        { $push : {comments: comment}},
    );

    res.redirect('/existingreview/'+req.params.id);
});

module.exports = router;