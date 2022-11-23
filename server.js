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
app.set('view engine', 'ejs');
app.set('port', port);

/**
const secrets = require('./.secrets');
const dbURL = secrets.dbURL;
const cookieSecret = secrets.cookieSecret;
*/

const dbURL = process.env.dbURL;
const cookieSecret = process.env.cookieSecret;


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



const loginRoute = require("./controllers/login");
const registerRoute = require("./controllers/register");
const createNewReviewRoute = require("./controllers/createNewReview");
const existingReviewRoute = require("./controllers/existingReview");
const mainRoute = require("./controllers/main");




app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/createNewReview', createNewReviewRoute);
app.use('/existingReview', existingReviewRoute);
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

