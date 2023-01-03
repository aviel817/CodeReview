const mongoose = require("mongoose");
const path = require('path');
const Review = require('./models/review');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const LOCAL_ADDRESS= '0.0.0.0';
const expressSession = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(expressSession);
const isAuth = require("./auth");
const constants = require("./constants");

app.set('view engine', 'ejs');
app.set('port', port);


const dbURL = constants.dbURL;
const cookieSecret = constants.cookieSecret;

const store = new MongoDBStore({
    uri: dbURL,
    collection: 'mySessions'
  });


app.use(
    expressSession({
    resave: false,
    saveUninitialized: false,
    secret: cookieSecret,
    store: store
})
);

app.use(express.json());
/** 
app.use(express.urlencoded({
    extended: true,
 })
);
 */
const loginRoute = require("./controllers/login");
const registerRoute = require("./controllers/register");
const createNewReviewRoute = require("./controllers/createNewReview");
const existingReviewRoute = require("./controllers/existingReview");
const leaderboardRoute = require("./controllers/leaderboard");
const projectsRoute = require("./controllers/projects");
const profileRoute = require("./controllers/profile");
const badgesRoute = require("./controllers/badges");
const mainRoute = require("./controllers/main");



app.use('/uploads', express.static('uploads'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/imgs', express.static('imgs'));
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/createNewReview', createNewReviewRoute);
app.use('/existingReview', existingReviewRoute);
app.use('/leaderboard', leaderboardRoute);
app.use('/projects', projectsRoute);
app.use('/profile', profileRoute);
app.use('/badges', badgesRoute);
app.use('/', mainRoute);

app.listen(app.get('port'), () => {
    console.log(`Example app listening on port ${port}`);
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

