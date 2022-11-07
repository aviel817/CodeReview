const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
var bodyParser = require('body-parser');
const Review = require('../models/review');
const Project = require('../models/project');
const Tag = require('../models/tag');
const date = require('date-and-time');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/', async function (req, res) {
    const user = await Review.findById(mongoose.Types.ObjectId(req.session.userID));
    const repos = await Project.find({}).exec().then((items) => { return items });
    const tags = await Tag.find({}).exec().then((items) => { return items });
    //console.log('session userid: ' + req.session.userID);
    //console.log('repos: ' + repos);
    var projects = [];
    repos.forEach((item)=> {
        projects.push(item._id);
    });
	res.render(path.join(__dirname + "/../views/createNewReview.ejs"), {projects, tags});
});


router.post('/', urlencodedParser, async(req, res) =>  {  
    console.log(req.body);
    const reviewtitle = await Review.findOne({
        reviewtitle: req.body.reviewtitle
    });
    if(reviewtitle){
        res.redirect('/createNewReview');
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

router.post('/updateList', urlencodedParser, async(req, res) =>  { 
    const new_tags = req.body['tags[]']; 
    console.log(new_tags);
    const closedReviews = await Review.find({
            status: {$ne: 'open'},
            repository: "Project1"
    });
    var titles = []
    const maxPotentialMap = map();
    const currUserID = req.session.userID;

    closedReviews.forEach((review) => {
        if (review.authorID == currUserID)
        {
            return;
        }
        titles.push(review.reviewtitle);
        const exist_tags = review.tags;
        var intersec = exist_tags.filter(value => new_tags.includes(value));
        var union = new_tags.length + exist_tags.length - intersec.length;
        console.log("intersec: "+intersec.length);
        console.log("union: "+union);
        var func_res = (intersec.length) / (union);
        console.log("func: " + func_res);
        const points = 500;
        var func2 = Math.log(points+1) / 10;
        console.log("func2: " + func2);
        console.log("sum: " + (func_res*0.6+func2*0.4));
    });
    //const filteredArray = array1.filter(value => array2.includes(value));

    console.log(titles);
    res.status(200);
    res.send("none");
});

module.exports = router;