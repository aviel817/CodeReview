const express = require('express');
const mongoose = require("mongoose");

const User = require('../models/user');
const Review = require('../models/review');
const Notification = require('../models/notification');

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

    getUserByName: async (username) => {
        User.findOne({username: userName})
    },

    getUserProjects: async (userID) => {
        return await User.findById(mongoose.Types.ObjectId(userID)).then((item) => item.projects);
    },

    getNotifications: async (userID) => {
        return await Notification.find({receiver: userID, isRead: false});
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

    getLastCommentsNames: async (reviews) => {
        
        var lastCommentsNames = [];
        for (var i=0; i < reviews.length; i++)
        {
            if (reviews[i].comments.length != 0)
            {
                var commentsUser = await User.findById(mongoose.Types.ObjectId(reviews[i].comments[reviews[i].comments.length-1].userID)).then((user)=> {return user}).catch((err)=>console.log(err));
                username = commentsUser.username;
                lastCommentsNames.push(username);
            }
        }
        return lastCommentsNames;
    }

}