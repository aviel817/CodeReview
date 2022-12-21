const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: String,
    description: String,
    value: Number,
    type: String,
    countMax: Number,
    Rank: String
  }, {
    collection: 'Badges'
});
const Badge = mongoose.model('Badges', badgeSchema);

module.exports = Badge;