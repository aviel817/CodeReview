const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    authorID: mongoose.Types.ObjectId,
    assignedReviewers: [mongoose.Types.ObjectId],
    repository: String,
    votes: Number,
    creationDate: String,
    expirationDate: String,
    reviewtitle: String,
    code: [String],
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
    ]
  }, {
    collection: 'Reviews'
});
const Review = mongoose.model('Reviews', reviewSchema);

module.exports = Review;