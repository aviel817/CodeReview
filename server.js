const mongoose = require("mongoose");
const path = require('path');
const express = require('express')
const app = express()
const port = 3000

const loginRoute = require("./login");

app.use('/login', loginRoute);

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

const dbURL = "mongodb+srv://adminCR:fcz6B6s2mN2VAxsV@cluster0.w955u.mongodb.net/CodeReview";

mongoose.connect(dbURL)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })


const reviewSchema = new mongoose.Schema({
    authorID: Number,
    assignedReviewers: [Number],
    votes: Number,
    creationDate: String,
    expirationDate: String
  }, {
    collection: 'Reviews'
});

const Review = mongoose.model('Reviews', reviewSchema);

Review.findOne({authorID: {$gte:1} }, function (err, docs) {
    if (err){
        console.log(err)
    }
    else{
        console.log("Result : ", docs.votes);
    }
});


app.use(express.static(__dirname));

app.get("/log-in", function (req, res) {
    res.sendFile(path.join(__dirname + "/login.html"));
  });