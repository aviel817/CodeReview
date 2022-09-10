const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    authorID: Number,
    assignedReviewers: [Number],
    votes: Number,
    creationDate: String,
    expirationDate: String,
    reviewtitle: String,
    code:String,
    comments: [
      {
        userID: Number,
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