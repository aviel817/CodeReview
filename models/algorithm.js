const mongoose = require('mongoose');

const algSchema = new mongoose.Schema({
    alpha: Number,
    beta: Number,
    gamma: Number,
    delta: Number,
  }, {
    collection: 'Algorithm'
});
const Algorithm = mongoose.model('Algorithm', algSchema);

module.exports = Algorithm;