const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const date = require('date-and-time');
const Review = require('../models/review');

router.post('/', urlencodedParser, async(req, res) =>  {  
    const review = await Review.findOne({
        ReviewID: req.body._id
    });
    const pattern = date.compile('D/MM/YYYY HH:mm:ss');
    const comment = {
        userID: 1,
        date: date.format(new Date(), pattern),
        content: "aaaa",
        vote: "+1"
    };
    review.comments.push(comment);
    review.save();
});