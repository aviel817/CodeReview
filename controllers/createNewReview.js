const express = require('express');
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
const Review = require('../models/review');
const date = require('date-and-time');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + "/../views/CreateNewReview.html"));
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
        const pattern = date.compile('D/MM/YYYY HH:mm:ss');
        new Review({
            authorID: 5,
            assignedReviewers: [0, 1, 2],
            votes: 0,
            creationDate:  date.format(new Date(), pattern),
            expirationDate: date.format(date.addDays(new Date(), 3),pattern),
            reviewtitle: req.body.reviewtitle,
            code: req.body.code
        }).save()
        res.send('You have created a new review');
    }
});

module.exports = router;