const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    totalPoints: Number,
    projects: [String],
    permission : Number,
    email: String,
    role: String,
    recievedBadges: [
        {
            name: String,
            amount: Number,
            Rank: String
        },
        require, false
    ]
}, {
    collection: 'Users'
});

const User = mongoose.model('Users', userSchema);

module.exports = User;