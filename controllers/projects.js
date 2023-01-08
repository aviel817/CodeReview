const express = require('express');
const router = express.Router();
const path = require('path');
const Project = require('../models/project');
const Review = require('../models/review');
const queries = require('./queries');

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
    const projects = await Project.find({});
    const userID = req.session.userID;
    const notifications = await queries.getNotifications(userID);
    const reviewsCount = [];
    for (let proj of projects)
    {
        var count = await Review.find({project: proj.projectName}).count();
        reviewsCount.push(count);
    }
	res.render(path.join(__dirname + "/../views/projectsList.ejs"), {userID, notifications, projects, reviewsCount});
});

router.get('/:id', isAuth, async function (req, res) {
    const projectName = req.params.id;
    const userID = req.session.userID;
    const notifications = await queries.getNotifications(userID);
    const reviews = await Review.find({project: req.params.id});
    const authors = await queries.getReviewAuthors(reviews);
    const [lastCommentsIDs, lastCommentsNames] = await queries.getLastComments(reviews);

	res.render(path.join(__dirname + "/../views/projectPage.ejs"), {userID, notifications, projectName, reviews, lastCommentsIDs, lastCommentsNames, authors});
});


module.exports = router;