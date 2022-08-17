const express = require('express');
const router = express.Router();
const path = require('path');
var bodyParser = require('body-parser')

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/login.html"));
  })


router.post("/", urlencodedParser, async (req, res) => {
    if (req.body != null)
    {
        console.log(req.body);

    }
    res.send("The request sent!");
    //var loginUser = req.body.loginUser;
    //var email = loginUser.email;
    //var password = loginUser.password;

});

module.exports = router;

