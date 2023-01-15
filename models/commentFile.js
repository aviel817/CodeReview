const mongoose = require('mongoose');

const commentFileSchema = new mongoose.Schema({
    name: String,
    uploadDate: String,
    data: Buffer,
    reviewID: mongoose.Types.ObjectId,
    commentID: mongoose.Types.ObjectId
  }, {
    collection: 'commentFiles'
});
const commentFile = mongoose.model('commentFiles', commentFileSchema);

module.exports = commentFile;