const mongoose = require("mongoose");
const path = require('path');
const Review = require('./models/review');
const express = require('express');
const app = express();
const port = 3000

const loginRoute = require("./controllers/login");
const registerRoute = require("./register");
const createNewReviewRoute = require("./controllers/createNewReview");

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/createNewReview', createNewReviewRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

const secrets = require('./.secrets');
const dbURL = secrets.dbURL;

mongoose.connect(dbURL)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })



Review.findOne({authorID: {$gte:1} }, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Result : ", docs.votes);
    }
});

