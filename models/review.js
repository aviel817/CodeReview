const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    authorID: mongoose.Types.ObjectId,
    assignedReviewers: [mongoose.Types.ObjectId],
    project: String,
    creationDate: String,
    expirationDate: String,
    reviewtitle: String,
    text: String,
    status: String,
    tags: [String],
    comments: [
      {
        userID: mongoose.Types.ObjectId,
        date: String,
        content: String,
        vote: String
      },
      require, true
    ],
    lastVotes: [
      {
        userID: mongoose.Types.ObjectId,
        userVote: String
      },
      require, true
    ],
    files: [
      {
        name: String,
        uploadDate: String,
        data: Buffer
      }
    ]
  }, {
    collection: 'Reviews'
});
const Review = mongoose.model('Reviews', reviewSchema);

module.exports = Review;