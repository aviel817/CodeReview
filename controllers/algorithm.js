const mongoose = require("mongoose");
const Review = require('../models/review');

module.exports = {

        sharedReviews: async (authorID, assignedReviewerID, newTagsList, project) => {
            //console.log(Array.from(newTagsList))
            const numOfSharedReviews = await Review.aggregate([
                {
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
                    ]
                  }
                }, {
                  '$match': {
                    'tags': {
                      '$in': [...newTagsList]
                    }
                  }
                }, {
                  '$match': {
                    'project': project, 
                    'status': 'Approved'
                  }
                }, {
                  '$project': {
                    'creationDate': 1, 
                    'assignedReviewers': 1, 
                    'authorID': 1, 
                    'tags': 1
                  }
                }, {
                  '$count': 'sharedReviewsCount'
                }
              ]);
        numOfSharedReviewsExt = numOfSharedReviews[0]?.sharedReviewsCount;
        const totalNumOfReviews = await Review.aggregate([
            {
              '$match': {
                '$or': [
                  {
                    'authorID':  mongoose.Types.ObjectId(authorID)
                  }, {
                    'assignedReviewers':  mongoose.Types.ObjectId(authorID)
                  }
                ]
              }
            }, {
              '$match': {
                'tags': {
                  '$in': [...newTagsList]
                }
              }
            }, {
              '$match': {
                'project': project
              }
            }, {
              '$count': 'numOfReviews'
            }
              ]);
        totalNumOfReviewsExt = totalNumOfReviews[0]?.numOfReviews;
        return (numOfSharedReviewsExt / totalNumOfReviewsExt) || 0;
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
