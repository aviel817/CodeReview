const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');


const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
	res.render(path.join(__dirname + "/../views/profile.ejs"), {});
});


module.exports = router;