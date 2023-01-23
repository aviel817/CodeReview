const express = require('express');
const mongoose = require("mongoose");
const Badge = require('../models/badge');

module.exports = {
  getNumOfCreatedReviews: async (userID) => {
      const authorReviews = await Review.aggregate([
          [
              [
                  {
                    '$match': {
                      'authorID': userID
                    }
                  }, {
                    '$count': 'createdReviews'
                  }
                ]
          ]
      ])


      return authorReviews[0]?.createdReviews || 0;
  },

  authorProjectReviews: async (userID, projectName) => {
      const authorProjectReviews = await Review.aggregate([
          [
              {
                '$project': {
                  'authorID': 1, 
                  'project': 1
                }
              }, {
                '$match': {
                  'authorID': authorID, 
                  'project': newRev.project
                }
              }, {
                '$count': 'projectRevs'
              }
            ]
      ])


      return authorProjectReviews[0]?.projectRevs || 0;
  },

  numberofAssignedRevs: async (userID, projName) =>{
      const numberOfAssignedRevs = await User.aggregate([
          [
              {
                '$project': {
                  'assignedReviewers': 1, 
                  'project': 1
                }
              }, {
                '$match': {
                  'assignedReviewers': userID, 
                  'project': projName
                }
              }, {
                '$count': 'assignedRevs'
              }
            ]
      ])
      return numberOfAssignedRevs[0]?.assignedRevs || 0;
  },

  numCommentsInReview: async(reviewID, userID) => {
      const reviewerComments = await Review.aggregate([
          [
            {
              '$project': {
                'assignedReviewers': 1, 
                'comments': 1
              }
            }, {
              '$match': {
                '_id': reviewID
              }
            }, {
              '$unwind': {
                'path': '$comments'
              }
            }, {
              '$match': {
                'comments.userID': userID
              }
            }, {
              '$count': 'countComments'
            }
          ]
        ])
        return reviewerComments[0]?.countComments ||0;
  },

  commentedMostInReview : async(reviewID) => {
      return await Review.aggregate([
          [
            {
              '$project': {
                'comments.userID': 1
              }
            }, {
              '$match': {
                '_id': reviewID
              }
            }, {
              '$unwind': {
                'path': '$comments'
              }
            }, {
              '$group': {
                '_id': '$comments.userID', 
                'count': {
                  '$sum': 1
                }
              }
            }, {
              '$sort': {
                'count': -1
              }
            }, {
              '$limit': 1
            }
          ]
        ])
  },

  createUserBronzeBadge: async (userID, bronzeBadge) => {
      const badge = {
          name: bronzeBadge.name,
          amount: 1,
          Rank: bronzeBadge.Rank
      };
      await User.findOneAndUpdate(
          {_id: userID},
          { $push : {recievedBadges: badge},
            $inc : {'totalPoints' : 2}}
      );
  },

  updateBronzeBadge: async (userID,bronzeBadgeName) => {
      await User.findOneAndUpdate(
          {_id: userID, 'recievedBadges.name':  bronzeBadgeName},
          { $inc : {'totalPoints' : 2, 'recievedBadges.amount':1 }}
            );
  },

  createUserSilverBadge: async (userID,silverBadge) => {
      const badge = {
          name: silverBadge.name,
          amount: 1,
          Rank: silverBadge.Rank
      };
      await User.findOneAndUpdate(
          {_id: userID},
          { $push : {recievedBadges: badge},
            $inc : {'totalPoints' : 5}}
      );
  },

  updateSilverBadge: async (userID,silverBadgeName) => {
      await User.findOneAndUpdate(
          {_id: userID, 'recievedBadges.name':  silverBadgeName},
          { $inc : {'totalPoints' : 5, 'recievedBadges.amount':1 }}
            );
  },

  createUserGoldBadge: async (userID, goldBadge) => {
      const badge = {
          name: goldBadge.name,
          amount: 1,
          Rank: goldBadge.Rank
      };
      await User.findOneAndUpdate(
          {_id: userID},
          { $push : {recievedBadges: badge},
            $inc : {'totalPoints' : 10}}
      );
  },

  updateGoldBadge: async (userID,goldBadgeName) => {
      await User.findOneAndUpdate(
          {_id: userID, 'recievedBadges.name':  goldBadgeName},
          { $inc : {'totalPoints' : 5, 'recievedBadges.amount':1 }}
            );
  },

  checkIfBadgeExists: async (userID, badgeName) =>{
      return await User.aggregate([
          [
            {
              '$project': {
                'recievedBadges': 1
              }
            }, {
              '$match': {
                '_id': userID
              }
            }, {
              '$unwind': {
                'path': '$recievedBadges'
              }
            }, {
              '$match': {
                'recievedBadges.name': badgeName
              }
            }
          ]
        ])
  }
}