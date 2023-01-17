const mongoose = require("mongoose");
const Review = require('../models/review');

module.exports = {

        sharedReviews: async (authorID, assignedReviewerID, newTagsList, project) => {
            var numOfSharedReviews = await Review.aggregate([
                {
                  '$project': {
                    'creationDate': 1, 
                    'assignedReviewers': 1, 
                    'authorID': 1, 
                    'tags': 1, 
                    'status': 1
                  }
                }, {
                  '$match': {
                    '$and': [
                      {
                        '$or': [
                          {
                            'authorID': mongoose.Types.ObjectId(authorID)
                          }, {
                            'assignedReviewers': mongoose.Types.ObjectId(authorID)
                          }
                        ]
                      }, {
                        '$or': [
                          {
                            'authorID': mongoose.Types.ObjectId(assignedReviewerID)
                          }, {
                            'assignedReviewers': mongoose.Types.ObjectId(assignedReviewerID)
                          }
                        ]
                      }
                    ], 
                    'status': 'Approved', 
                    'tags': {
                      '$in': newTagsList
                    },
                    'project': project
                  }
                }, {
                  '$count': 'sharedReviewsCount'
                }
              ]);
        numOfSharedReviews = numOfSharedReviews[0]?.sharedReviewsCount;
        var totalNumOfReviews = await Review.aggregate([
                {
                  '$project': {
                    'creationDate': 1, 
                    'assignedReviewers': 1, 
                    'authorID': 1, 
                    'tags': 1, 
                    'status': 1
                  }
                }, {
                  '$match': {
                    '$or': [
                      {
                        'authorID': mongoose.Types.ObjectId(authorID)
                      }, {
                        'assignedReviewers': mongoose.Types.ObjectId(authorID)
                      }
                    ], 
                    'tags': {
                      '$in': newTagsList
                    },
                    'project': project
                  }
                }, {
                  '$count': 'numOfReviews'
                }
              ]);
        totalNumOfReviews = totalNumOfReviews[0]?.numOfReviews;
        return (numOfSharedReviews / totalNumOfReviews) || 0;
    },

    workload: async (userID) => {
        var wl = await Review.aggregate([
            {
              '$project': {
                'authorID': 1, 
                'assignedReviewers': 1, 
                'status': 1
              }
            }, {
              '$match': {
                '$or': [
                  {
                    'authorID': mongoose.Types.ObjectId(userID)
                  }, {
                    'assignedReviewers': mongoose.Types.ObjectId(userID)
                  }
                ], 
                'status': 'open'
              }
            }, {
              '$count': 'wlCount'
            }
          ]);
        wl = wl[0]?.wlCount || 0;
        return wl;
    },

    calcWorkload(numOfOpenReviews)
    {
        return Math.E ** (-0.1 * numOfOpenReviews);
    }

}
