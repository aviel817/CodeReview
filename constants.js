const nodemailer = require('nodemailer');

let secrets;
let emailUser;
let emailPass;
try {
    secrets = require('./.secrets');
    exports.dbURL = secrets.dbURL;
    exports.cookieSecret = secrets.cookieSecret;
    emailUser = secrets.emailUser;
    emailPass = secrets.emailPass;
} catch (err) {
    exports.dbURL = process.env.dbURL;
    exports.cookieSecret = process.env.cookieSecret;
    emailUser = process.env.emailUser;
    emailPass = process.env.emailPass;
}


exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });