const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: String,
    projectManager: mongoose.Types.ObjectId,
    projectDescription: String
  }, {
    collection: 'Projects'
});
const Project = mongoose.model('Projects', projectSchema);

module.exports = Project;