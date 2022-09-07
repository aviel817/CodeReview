const mongoose = require("mongoose");
const path = require('path');
const Review = require('./models/review');
const express = require('express');
const app = express();
const port = 3000;
const expressSession = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(expressSession);

const secrets = require('./.secrets');
const dbURL = secrets.dbURL;

const loginRoute = require("./controllers/login");
const registerRoute = require("./controllers/register");
const createNewReviewRoute = require("./controllers/createNewReview");

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/createNewReview', createNewReviewRoute);

const store = new MongoDBStore({
    uri: dbURL,
    collection: 'mySessions'
  });

app.use(
    expressSession({
    resave: false,
    saveUninitialized: false,
    secret: secrets.cookieSecret,
    store: store
})
);

const isAuth = (req, res, next) => {
    if (req.session.isAuth)
    {
        next();
    }
    res.redirect('login');
}


app.get('/', isAuth, (req, res) => {
    console.log(req.session);
    res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

app.get('*', function(req, res){
    res.status(404).sendFile(path.join(__dirname + "/views/404.html"));
  });

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

