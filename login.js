const express = require('express');
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser');
const argon2 = require('argon2');
const mongoose = require('mongoose');
const User = require('./models/user');

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.use('/css', express.static('css'));
router.use('/js', express.static('js'));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/login.html"));
  });


router.post("/", urlencodedParser, async (req, res) => {
    if (req.body != null)
    {
        console.log(req.body);
        const user = await User.findOne({
            username: req.body.username
        });
        if(user){
            dbPass = user.password;
            console.log("db pass: " + dbPass);
            try {
                hash = await argon2.hash(req.body.password);
                console.log("hash: " + hash);
              } catch (err) {
                console.log("ERROR " + err);
              }
              try {
                if (await argon2.verify(hash, dbPass)) {
                  // password match
                  console.log("matched");
                } else {
                  // password did not match
                  console.log("not matched");
                }
              } catch (err) {
                // internal failure
                console.log("ERROR", err);
              }
        }
        else {

              console.log("User doesn't exist!");
        }

    }
    res.sendStatus(201);

});

module.exports = router;

