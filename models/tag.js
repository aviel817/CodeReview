const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: String
  }, {
    collection: 'Tags'
});
const Tag = mongoose.model('Tags', tagSchema);

module.exports = Tag;