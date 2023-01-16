const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const Review = require('../models/review');

const dataFuncs = require('./dataFuncs');
const queries = require('./queries');

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
    const userID = req.session.userID;
    const notifications = await queries.getNotifications(userID);
	res.render(path.join(__dirname + "/../views/manage.ejs"), {userID, notifications});
});


module.exports = router;