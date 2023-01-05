const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
var bodyParser = require('body-parser');
const User = require('../models/user');
const Notification = require('../models/notification');
var urlencodedParser = bodyParser.urlencoded({ extended: true });


router.post('/updateRead', urlencodedParser, async(req, res) =>  { 
    if (req.body.read == 'true')
    {
        const userID = req.session.userID;
        const queryRes = await Notification.updateMany({receiver: userID}, { isRead: true });
        res.status(200);
        res.send("success");
    }
    return res.status(400);
    
});

module.exports = router;