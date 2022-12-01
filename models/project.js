const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: String,
    projectManager: mongoose.Types.ObjectId
  }, {
    collection: 'Projects'
});
const Project = mongoose.model('Projects', projectSchema);

module.exports = Project;