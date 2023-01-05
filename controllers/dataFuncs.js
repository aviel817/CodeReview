const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const User = require('../models/user');
const Review = require('../models/review');

module.exports = {
    countComments: async (userID) => {
        const commentsCountQuery = await Review.aggregate([
            [
                {
                  '$match': {
                    'comments.userID': mongoose.Types.ObjectId(userID)
                  }
                }, {
                  '$project': {
                    'comments.userID': 1
                  }
                }, {
                  '$unwind': {
                    'path': '$comments'
                  }
                }, {
                  '$match': {
                    'comments.userID': mongoose.Types.ObjectId(userID)
                  }
                }, {
                  '$count': 'commentsCount'
                }
              ]
            ])


        return commentsCountQuery[0]?.commentsCount || 0;
    },
    
    countReviewsCreated: async (userID) => {
      return await Review.countDocuments({authorID: mongoose.Types.ObjectId(userID)});
    },

    countReviewsParticipated: async (userID) =>{
      return await Review.countDocuments({assignedReviewers: mongoose.Types.ObjectId(userID)});
    } 
  
}