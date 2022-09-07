const express = require('express');
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
const Review = require('../models/review');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + "/CreateNewReview.html"));
});

router.post('/', urlencodedParser, async(req, res) =>  {  
    console.log(req.body);
    const reviewtitle = await Review.findOne({
        reviewtitle: req.body.reviewtitle
    });
    if(reviewtitle){
        res.redirect('/CreateNewReview');
    }
    else{
        var currentDate = new Date();
        new Review({
            authorID: 5,
            assignedReviewers: [0, 1, 2],
            votes: 0,
            creationDate: "2022-08-21",
            expirationDate: "2022-08-24",
            reviewtitle: req.body.reviewtitle,
            code: req.body.code
        }).save()
        res.send('You have created a new review');
    }
});

module.exports = router;