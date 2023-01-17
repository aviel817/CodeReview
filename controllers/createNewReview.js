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
const nodemailer = require('nodemailer');
const constants = require("../constants");
const upload = require('../middlewares/upload');
const queries = require('./queries');
const algorithm = require('./algorithm');
const { resolveSoa } = require('dns');

var urlencodedParser = bodyParser.urlencoded({ extended: true });
var urlencodedParser2 = bodyParser.urlencoded({ extended: false });

const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };

router.get('/', isAuth, async function (req, res) {
    const userID = req.session.userID;
    const projs = await queries.getUserProjects(userID);
    const tags = await Tag.find({}).exec().then((items) => { return items });
    const notifications = await queries.getNotifications(userID);
    
    const users = await User.find({_id: {$ne: userID}}).exec().then((items)=> {return items} );

	res.render(path.join(__dirname + "/../views/createNewReview.ejs"), {userID, notifications, users, projs, tags});
});


router.post('/', urlencodedParser2, upload.single('codeFile'), async(req, res) =>  {  

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
            creationDate: date.format(new Date(), pattern),
            expirationDate: date.format(date.addDays(new Date(), 3),pattern),
            reviewtitle: reviewTitle,
            text: req.body.text,
            status: 'open',
            tags: req.body['tags[]'],
            project: req.body.project
        }).save()
        var ntfcsArr = []
        const mailOptions = {
            from: 'GamiRev2022@gmail.com',
            to: 'aviel1440@gmail.com',
            subject: 'You have been associated as reviewer - GamiRev',
            text: 'The user ' + req.session.username + ' has associated you as reviewer in his new review ' +reviewTitle+ ' in GamiRev application'
          };
        constants.transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
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

router.post('/updateList', urlencodedParser2, async(req, res) =>  { 
    const new_tags = req.body['tags[]'];
    if (typeof new_tags === 'undefined')
    {
        return res.send(JSON.stringify([{maxPotentialMap: [], idsDict: []}]));
    }
    const selected_project = req.body['project']; 
    //console.log(new_tags);
    console.log(selected_project);
    console.log(new_tags);
    const closedReviews = await Review.find({
            status: {$ne: 'open'},
            repository: selected_project
    });
    
    var titles = []
    const maxPotentialMap = new Map();
    const pointsMap = new Map();
    const workloadMap = new Map();
    const sharedReviewsMap = new Map();
    const countReviews = new Map();

    const idsDict = {};
    const currUserID = req.session.userID;
    const algParams = [0.35, 0.3, 0.05, 0.3];

    for (let closed_review of closedReviews)
    {
        titles.push(closed_review.reviewtitle);
        const exist_tags = closed_review.tags;

        var intersec = exist_tags.filter(value => new_tags.includes(value));
        var union = new_tags.length + exist_tags.length - intersec.length;
        var SharedTagsFunc = (intersec.length) / (union);


        for (let reviewer_userID of closed_review.assignedReviewers) 
        {
            if (reviewer_userID.equals(currUserID))
            {
                continue;
            }
            var reviewer_user = await queries.getUserByID(reviewer_userID);
            var reviewer_username = reviewer_user.username;

            if (!(pointsMap.has(reviewer_username)))
            {
                var points = reviewer_user.totalPoints;
                var pointsFunc = Math.log(points+1) / 10;
                pointsMap.set(reviewer_username, pointsFunc);
            }

            if (!sharedReviewsMap.has(reviewer_username))
            {
                var sharedReviews = await algorithm.sharedReviews(currUserID, reviewer_userID, new_tags);
                sharedReviewsMap.set(reviewer_username, sharedReviews);
            }

            if (!workloadMap.has(reviewer_username))
            {
                var workload = await algorithm.workload(reviewer_userID);
                workloadMap.set(reviewer_username, workload);
            }
            countReviews.set(reviewer_username, countReviews.get(reviewer_username) + 1 || 1);

            var cur_val = (maxPotentialMap.get(reviewer_username) || 0) + SharedTagsFunc;
            maxPotentialMap.set(reviewer_username.toString(), cur_val);
            idsDict[reviewer_username] = reviewer_userID;
        }
    }
    /**
    console.log(maxPotentialMap);
    console.log(pointsMap);
    console.log(workloadMap);
    console.log(sharedReviewsMap);
    console.log(countReviews);
    */
    for (const [key, value] of maxPotentialMap)
    {
        algValue = algParams[0] * (value / countReviews.get(key)) +
                   algParams[1] * sharedReviewsMap.get(key) +
                   algParams[2] * pointsMap.get(key) +
                   algParams[3] * await algorithm.calcWorkload(workloadMap.get(key));
        maxPotentialMap.set(key, algValue);
    }
    
    res.status(200);
    var dataToSend = [{maxPotentialMap: Array.from(maxPotentialMap.entries()), idsDict: idsDict}];
    res.send(JSON.stringify(dataToSend));
});

router.post('/uploadFile', urlencodedParser, upload.array('codeFiles'), async(req, res) =>  {  
    for (var i=0; i < req.files.length; i++)
    {
        var fileData = new Buffer.from(req.files[i].buffer, "base64")
        var pattern = date.compile('D/MM/YYYY HH:mm:ss');
        var file = {
            name: req.files[i].originalname,
            uploadDate: date.format(new Date(), pattern),
            data: fileData
        };
    
        await Review.findOneAndUpdate({_id: req.body.reviewID},
                                      {$push: {files: file}});    
    }
    
    res.status(200);
    res.send('success!');
});

module.exports = router;