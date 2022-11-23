const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const path = require('path');
const expressSession = require("express-session");

const Review = require('../models/review');
const User = require('../models/user');

const isAuth = (req, res, next) => {
    if (req.session.isAuth)
    {
        return next();
    }
    return res.redirect('/login');
  };

async function getUserDetails(userID) {
    await User.findById(mongoose.Types.ObjectId(userID)).then((user)=>user).catch((err)=>console.log(err));
}

router.get('/', isAuth, async (req, res) => {
    const selfReviews = await Review.find({authorID : req.session.userID}).exec().then((items) => { return items });
    const relatedReviews = await Review.find({assignedReviewers : req.session.userID}).exec().then((items) => { return items });
    const user = User.findById(mongoose.Types.ObjectId(req.session.userID));

    var lastCommentsNames = [];
    var authors = [];
    var username = "";
    for (var i=0; i < selfReviews.length; i++)
    {
        if (selfReviews[i].comments.length != 0)
        {
            var commentsUser = await User.findById(mongoose.Types.ObjectId(selfReviews[i].comments[selfReviews[i].comments.length-1].userID)).then((user)=> {return user}).catch((err)=>console.log(err));
            username = commentsUser.username;
            lastCommentsNames.push(username);
        }
    }
    for (var i=0; i < relatedReviews.length; i++)
    {
        var author = await User.findOne({userID : mongoose.Types.ObjectId(relatedReviews[i].authorID)}).exec().then((items) => { return items.username });
        authors.push(author);
    }


    res.render(path.join(__dirname + "/../views/index.ejs"), {selfReviews, lastCommentsNames, relatedReviews, authors});
});


module.exports = router;