const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const Project = require('../models/project');
const Review = require('../models/review');

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


module.exports = router;