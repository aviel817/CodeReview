const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    totalPoints: Number,
    projects: [Number],
    permission : Number,
    email: String
}, {
    collection: 'Users'
});

const User = mongoose.model('Users', userSchema);

module.exports = User;