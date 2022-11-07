const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    _id: String,
    projectManager: mongoose.Types.ObjectId
  }, {
    collection: 'Projects'
});
const Project = mongoose.model('Projects', projectSchema);

module.exports = Project;