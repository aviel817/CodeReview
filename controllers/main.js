const express = require('express');
const router = express.Router();
const path = require('path');
const queries = require('./queries');

const isAuth = (req, res, next) => {
    if (req.session.isAuth)
    {
        return next();
    }
    return res.redirect('/login');
  };


router.get('/', isAuth, async (req, res) => {
    const userID = req.session.userID;
    const selfReviews = await queries.getReviewsByUserID(userID);
    const relatedReviews = await queries.getRelatedReviews(userID);

    const notifications = await queries.getNotifications(userID);
    const [lastCommentsIDs, lastCommentsNames] = await queries.getLastComments(selfReviews);
    const authors = await queries.getReviewAuthors(relatedReviews);

    res.render(path.join(__dirname + "/../views/index.ejs"), {selfReviews, lastCommentsIDs, lastCommentsNames, relatedReviews, authors, notifications, userID});
});


module.exports = router;