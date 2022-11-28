const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiver: String,
    content: String,
    isRead: Boolean,
    timeCreated: String
  }, {
    collection: 'Notifications'
});
const Notification = mongoose.model('Notifications', notificationSchema);

module.exports = Notification;