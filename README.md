# GamiRev


GamiRev is a code review web application that makes the code review process more efficient by using a matching algorithm to find the most fitting reviewers for a review. The algorithm considers the following aspects: reviews with similar interests, the user's points, the user's workload, and the user's collaboration with the code author. We aim to reduce the selection of inappropriate reviewers by allowing the author to take better-informed decisions. In addition, the application includes gamification elements such as points, badges, and a leaderboard to motivate reviewers to contribute to the process.




## Features
- Hybrid filtering recommendation system
- Upload and download files
- Get notifications in site and on mail
- Gamificiation elements: badges, points and leaderboard
- Login using sessions
- Secure password storage using argon2

## Technologies

GamiRev uses the following technlogies:

- HTML5
- CSS
- JavaScript
- [Node.js]
- [Express]
- [jQuery] 
- [Bootstrap]
- [Mongoose]



## Installation

GamiRev requires [Node.js](https://nodejs.org/) v18+ to run.
It also requires a MongoDB database with the needed collections in the code. 

To install the dependencies run:

```sh
npm i
```
The app constant variables should be stored either in process enviornment or in the .secrets (json) file. The structure of the .secrets file is:

```sh
 {
    "dbURL":"",
    "cookieSecret":"",
    "emailUser":"",
    "emailPass":""
}
```

## Screenshots


![alg1](https://i.imgur.com/r7G8xXd.png)

Choosing from recommended reviewers:
![alg2](https://i.imgur.com/Mmzl1aB.png)

Existing review screen:
![existingreview](https://i.imgur.com/3BYLncd.png)

Files and Comments section in existing review:
![filesandcomments](https://i.imgur.com/T6laXpQ.png)



[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

 
   [Node.js]: <http://nodejs.org>
   [Bootstrap]: <https://getbootstrap.com/>
   [jQuery]: <http://jquery.com>
   [express]: <http://expressjs.com>
   [Mongoose]: <https://mongoosejs.com/>




