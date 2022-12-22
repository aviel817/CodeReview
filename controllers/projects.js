const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const Project = require('../models/project');
const Review = require('../models/review');
const User = require('../models/user');

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
    const projects = await Project.find({});
    const reviewsCount = [];
    for (let proj of projects)
    {
        var count = await Review.find({project: proj.projectName}).count();
        reviewsCount.push(count);
    }
	res.render(path.join(__dirname + "/../views/projects.ejs"), {projects, reviewsCount});
});

router.get('/:id', isAuth, async function (req, res) {
    const projectName = req.params.id;
    const reviews = await Review.find({project: req.params.id});
    var lastCommentsNames = [];

    for (var i=0; i < reviews.length; i++)
    {
        if (reviews[i].comments.length != 0)
        {
            var commentsUser = await User.findById(mongoose.Types.ObjectId(reviews[i].comments[reviews[i].comments.length-1].userID)).then((user)=> {return user}).catch((err)=>console.log(err));
            username = commentsUser.username;
            lastCommentsNames.push(username);
        }
    }
    console.log(reviews.length);
	res.render(path.join(__dirname + "/../views/projectlist.ejs"), {projectName, reviews, lastCommentsNames});
});


module.exports = router;