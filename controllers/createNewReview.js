const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
var bodyParser = require('body-parser');
const Review = require('../models/review');
const Project = require('../models/project');
const User = require('../models/user');
const Tag = require('../models/tag');
const date = require('date-and-time');
const Notification = require('../models/notification');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };

router.get('/', isAuth, async function (req, res) {
    const user = await User.findById(mongoose.Types.ObjectId(req.session.userID));
    const projs = user.projects;
    const tags = await Tag.find({}).exec().then((items) => { return items });
    
    console.log(projs);
	res.render(path.join(__dirname + "/../views/createNewReview.ejs"), {projs, tags});
});


router.post('/', urlencodedParser, async(req, res) =>  {  
    console.log(req.body);
    const chosenReviewers = req.body['chosenRows[]'];
    const existingReview = await Review.findOne({
        reviewtitle: req.body.reviewtitle,
        project: req.body.project
    });
    if(existingReview){
        res.redirect('/createNewReview');
    }
    else{
        const pattern = date.compile('D/MM/YYYY HH:mm:ss');
        const reviewTitle = req.body.title;
        const newRev = await new Review({
            authorID: req.session.userID,
            assignedReviewers: chosenReviewers,
            votes: 0,
            creationDate: date.format(new Date(), pattern),
            expirationDate: date.format(date.addDays(new Date(), 3),pattern),
            reviewtitle: reviewTitle,
            code: req.body.code,
            status: 'open',
            tags: req.body['tags[]'],
            project: req.body.project
        }).save()
        var ntfcsArr = []
        for (var reviewer of chosenReviewers)
        {
            var newNotification = {
                receiver: reviewer,
                content: "You have been associated as reviewer to the review "+reviewTitle,
                isRead: false,
                timeCreated: new Date()
            };
            ntfcsArr.push(newNotification);
        }
        Notification.insertMany(ntfcsArr, function(err, docs) {
            if (err) throw err;
        });
        res.send(newRev._id);
    }

});

router.post('/updateList', urlencodedParser, async(req, res) =>  { 
    const new_tags = req.body['tags[]'];
    const selected_project = req.body['project']; 
    //console.log(new_tags);
    console.log(selected_project);
    const closedReviews = await Review.find({
            status: {$ne: 'open'},
            repository: "Processor"
    });
    
    var titles = []
    const maxPotentialMap = new Map();
    const idsDict = {};
    const currUserID = req.session.userID;
    const alpha = 0.6;
    const beta = 0.4;
    for (let closed_review of closedReviews)
    {
        titles.push(closed_review.reviewtitle);
        const exist_tags = closed_review.tags;

        var intersec = exist_tags.filter(value => new_tags.includes(value));
        var union = new_tags.length + exist_tags.length - intersec.length;
        var func1 = (intersec.length) / (union);
        //console.log(typeof(closed_review.assignedReviewers));
        //console.log(closed_review.assignedReviewers);
        for (let reviewer_userID of closed_review.assignedReviewers) 
        {
            var reviewer_user = await User.findOne({_id: reviewer_userID}).exec().then((items) => { return items });;
            var points = reviewer_user.totalPoints;
            var reviewer_username = reviewer_user.username;
            var func2 = Math.log(points+1) / 10;
            var sum = func1*alpha+func2*beta;
            var cur_val = maxPotentialMap.get(reviewer_username) || 0;
            maxPotentialMap.set(reviewer_username.toString(), Math.max(sum, cur_val));
            idsDict[reviewer_username] = reviewer_userID;
        }
    }
    //const filteredArray = array1.filter(value => array2.includes(value));
    //console.log("entries:");
    //console.log(maxPotentialMap);
    //console.log(titles);
    res.status(200);
    var dataToSend = [{maxPotentialMap: Array.from(maxPotentialMap.entries()), idsDict: idsDict}];
    res.send(JSON.stringify(dataToSend));
});

module.exports = router;