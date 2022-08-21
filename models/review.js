const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    authorID: Number,
    assignedReviewers: [Number],
    votes: Number,
    creationDate: String,
    expirationDate: String,
    reviewtitle: String,
    code:String
  }, {
    collection: 'Reviews'
});
const Review = mongoose.model('Reviews', reviewSchema);

module.exports = Review;