const mongoose = require("mongoose");

const User = require('../models/user');
const Review = require('../models/review');
const Notification = require('../models/notification');
const Project = require('../models/project');
const Algorithm = require('../models/algorithm');
const Badge = require('../models/badge');
const date = require('date-and-time');

module.exports = {
/**
 * User Functions 
 */
    getUserByID: async (userID) => {
        return await User.findById(mongoose.Types.ObjectId(userID)).then((item) => item);
    },

    getUsernameByID: async (userID) => {
        return await module.exports.getUserByID(userID).then((user) => user.username);
    },

    getUserByName: async (userName) => {
        return await User.findOne({username: userName});
    },

    getUserProjects: async (userID) => {
        return await User.findById(mongoose.Types.ObjectId(userID)).then((item) => item.projects);
    },

    getNotifications: async (userID) => {
        return await Notification.find({receiver: userID, isRead: false});
    },

    getUserPermission: async (userID) => {
        return await module.exports.getUserByID(userID).then((user) => user.permission);
    },

/**
 * Review Functions 
 */
    getReviewByID: async (reviewID) => {
        return await Review.findById(mongoose.Types.ObjectId(reviewID));
    },

    getReviewsByUserID: async (userID) => {
        return await Review.find({authorID : userID});
    },

    getRelatedReviews: async (userID) => {
        return await Review.find({assignedReviewers : userID});
    },

    getReviewAuthors: async (reviews) => {
        var authors = [];
        for (var i=0; i < reviews.length; i++)
        {
            var author = await User.findOne({_id: mongoose.Types.ObjectId(reviews[i].authorID)}).exec().then((items) => { return items.username });
            authors.push(author);
        }
        return authors;
    },

    getLastComments: async (reviews) => {
        
        var lastCommentsNames = [];
        var lastCommentsIDs = [];
        for (var i=0; i < reviews.length; i++)
        {
            if (reviews[i].comments.length != 0)
            {
                var commentsUser = await User.findById(mongoose.Types.ObjectId(reviews[i].comments[reviews[i].comments.length-1].userID)).then((user)=> {return user}).catch((err)=>console.log(err));
                if (commentsUser)
                {
                    let username = commentsUser.username;
                    let userID = commentsUser._id;
                    lastCommentsNames.push(username);
                    lastCommentsIDs.push(userID);
                } else {
                    console.log("ERROR: Reading Comment User!");
                    return null;
                }
            }
        }
        return [lastCommentsIDs, lastCommentsNames];
    },

    changeStatusToApproved: async (reviewID) => {
        await Review.updateOne({_id: mongoose.Types.ObjectId(reviewID)},
                                [
                                { $unset: 'status'},
                                { $set: { 'status': 'Approved' }}
                                ]);

    },

    changeStatusToAbandoned: async (reviewID) => {
        var pattern = date.compile('D/MM/YYYY HH:mm:ss');
        await Review.updateOne({_id: mongoose.Types.ObjectId(reviewID)},
                                [
                                { $unset: 'status' },
                                { $unset: 'expirationDate'},
                                { $set: { 'status': 'Abandoned' } },
                                { $set: { 'expirationDate': date.format(new Date(), pattern)} }
                                ]);

    },

/**
 * Projects Functions 
 */

    getProjectByProjMgrID: async (projMgrID) => {
        return await Project.find({projectManager: mongoose.Types.ObjectId(projMgrID)});
    },

    getProjectByName: async (projName) => {
            return await Project.findOne({projectName: projName});
    },
/**
 * Algorithm Functioms
 */
    getAlgorithmParams: async () => {
        return await Algorithm.findById({_id: mongoose.Types.ObjectId('63c58f5612cebe7d97818836')});
    },

/**
 * Badges Functions
 */

    getBadgeByName: async (badgeName) => {
        return await Badge.find({name: badgeName});
    }


}