const mongoose = require("mongoose");
const path = require('path');
const Review = require('./models/review');
const express = require('express');
const app = express();
const port = 3000;
const expressSession = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(expressSession);
app.set('view engine', 'ejs');


const secrets = require('./.secrets');
const dbURL = secrets.dbURL;

const loginRoute = require("./controllers/login");
const registerRoute = require("./controllers/register");
const createNewReviewRoute = require("./controllers/createNewReview");

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


app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/createNewReview', createNewReviewRoute);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});



const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('login');
    }
    next();
};


app.get('/', isAuth, (req, res) => {
    console.log(req.session);
    res.send('Hello World!');
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

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

