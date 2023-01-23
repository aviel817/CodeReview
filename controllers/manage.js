const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const path = require('path');
const Review = require('../models/review');
const User = require('../models/user');
const Algorithm = require('../models/algorithm');
const Project = require('../models/project');
var bodyParser = require('body-parser');

const dataFuncs = require('./dataFuncs');
const queries = require('./queries');

var urlencodedParser = bodyParser.urlencoded({ extended: true });


const isAuth = (req, res, next) => {
    if (!req.session.isAuth)
    {
        return res.redirect('/');
    }
    next();
  };


router.get('/', isAuth, async function (req, res) {
    const userID = req.session.userID;
    const notifications = await queries.getNotifications(userID);
    const algParams = await queries.getAlgorithmParams();
    const usernamesList = await User.find({}, '_id username');
    const projsList = await Project.find({}, '_id projectName');
	res.render(path.join(__dirname + "/../views/manage.ejs"), {userID, notifications, algParams, usernamesList, projsList});
});


router.post('/updateAlgParams', urlencodedParser, async(req, res) =>  {  
    const alphaVal = parseFloat(req.body.alphaValue);
    const betaVal = parseFloat(req.body.betaValue);
    const gammaVal = parseFloat(req.body.gammaValue);
    const deltaVal = parseFloat(req.body.deltaValue);
    const sum = alphaVal + betaVal + gammaVal + deltaVal;

    if (alphaVal + betaVal + gammaVal + deltaVal != 1)
    {
        return res.status(400).send('sum of params need to be 1!');
    }
    
    await Algorithm.updateOne({_id: mongoose.Types.ObjectId('63c58f5612cebe7d97818836')},
        {
            'alpha': alphaVal,
            'beta': betaVal,
            'gamma': gammaVal,
            'delta': deltaVal
        });
    return res.status(200).send('algorithm parameters changed');
      
});

  
  router.post('/assignUserToProj', urlencodedParser, async(req, res) =>  {  
    const selUser = req.body.selUser;
    const selProj = req.body.selProj;
    const user = await queries.getUserByName(selUser);
    const project = await queries.getProjectByName(selProj);
    if (user && project)
    {
        var isAssigned = 0;
        if (user.projects)
        {
            user.projects.map((value, i) => 
            {
                if (value == selProj)
                {
                    isAssigned = 1;
                }
            });
        }
        
        if (isAssigned != 1)
        {
            await User.findOneAndUpdate({_id: user._id},
                                    { $push: {projects: selProj}});
            return res.status(200).send('The reviewer is assigned to the project');
        }
        return res.status(400).send('already assigned!');
    }

    /**if (req.body.content.length > 0)
    {
      await Review.updateOne({_id: req.params.id},
        {'reviewtitle': req.body.content});
      return res.status(200).send('review title changed');
    }
      **/
    res.status(400).send('Wrong username or project!');

});


router.post('/deleteUser', urlencodedParser, async(req, res) =>  {  
if (req.body.content.length > 0)
{
    const deletedUser = await User.findOneAndDelete({_id: req.body.userID});
    if (deletedUser)
    {
        return res.status(200).send('The user' + deletedUser.username +' deleted');
    }
}
res.status(400).send('User not found');

});

module.exports = router;