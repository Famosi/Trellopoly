var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs'); /* Used for crypt and decrypt passwd users */
var jwt = require('jsonwebtoken');
var fetch = require('node-fetch');
var https = require('https');
var express = require('express');

var router = express.Router();

/* Users' credentials are stored in one variable for convenience */
var users = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage/users.json'), 'utf8'));
var pendingUsr = {}

const verifykey = "ladonnanudaconlemaniintasca"; /* Key to generate verification tokens */
const accountkey = "cavallosolo"; /* Key to generate access tokens */


/* Generate user ID */
function uuidv4() {
  var usersString = JSON.stringify(users);
  var id, used = 1;
  while(used != -1){
  id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
    v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  used = usersString.indexOf(id);
  }
  return id;
}


/* Email-user sign Up */
router.post('/signup', function(req, res){
  var usrReq = req.body;
  var response = { success: true };
  /* Check if the credentials are valid */
  if (usrReq.username.length < 3) {
    response.success = false;
    response.field = "username"
    response.error = "Username must be at least 3 characters.";
  } else if (users.findIndex(checkusername, usrReq) != -1) {
    response.success = false;
    response.field = "username"
    response.error = "Username already used, try again.";
  } else if (usrReq.password.length < 5) {
    response.success = false;
    response.field = "password"
    response.error = "Password must be at least 5 characters.";
  } else if (usrReq.password !== usrReq.password_confirmation) {
    response.success = false;
    response.field = "confirm_psw"
    response.error = "Password doesn't match.";
  }

  if (response.success) {
    var userid = uuidv4();
    /* Generate verification token */
    var idv = jwt.sign({
      username: usrReq.username,
      id: userid
    }, verifykey, { expiresIn: 86400 }); /* 24 hours of validity */

    /* Create new pending user */
    var pnewusr = {
      "id" : userid,
      "token" : idv,
      "username" : usrReq.username,
      "password" : bcrypt.hashSync(usrReq.password, bcrypt.genSaltSync(8), null) /* Encrypt user password with salt */
    }

    pendingUsr[idv] = pnewusr;

    users.push(pendingUsr[idv]);
    delete pendingUsr[idv];

    response.username = usrReq.username

    usersUpdate()
    res.status(200).json(response);

  } else {
    res.status(200).json(response);
  }
});

/* Email-user login  */
router.post('/login',function(req, res){
  var usrReq = req.body;
  var response = {success: false};
  var usr = users.findIndex(findForCredentials, usrReq);

  if (usr >= 0) {
    /* Create new access token */
    users[usr].token = jwt.sign({
      username: users[usr].username,
      id: users[usr].id
    }, accountkey, { expiresIn: 86400 });

    response.id = users[usr].id;
    response.token = users[usr].token;
    response.username = users[usr].username;
    response.success = true;
  } else {
    response.field = "username"
    response.error = "Wrong username or password";
    console.log(response.error);
  }

  res.status(200).json(response);
  usersUpdate();
});


/* Verify Facebook access token */
router.post('/fblogin',function(req,res){
  var response = {};
  /* Check with API Facebook if the Facebook-token is valid  */
  fetch("https://graph.facebook.com/me?fields=id,name&access_token=" + req.body.authResponse.accessToken)
  .then(function(res){
    return(res.json());
  }).then(function(info) {
    /* Create new access token */
    response.token = jwt.sign({
      username: info.name.split(" ")[0],
      id: info.id
    }, accountkey, { expiresIn: 86400 });
    response.username = info.name.split(" ")[0];
    response.id = info.id;
    res.status(200).json(response);
  });
});

/* Verify Gmail access token  */
router.post('/glogin',function(req,res){
  var response = {};
  /* Check with API Google if the google-token is valid  */
  fetch("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=" + encodeURI(req.body.token))
  .then(function(res){
    return res.json();
  }).then(function(info){
    /* Create new access token */
    response.token = jwt.sign({
      username: info.name.split(" ")[0],
      id: info.sub
    }, accountkey, { expiresIn: 86400 });
    response.username = info.name.split(" ")[0];
    response.id = info.sub;
    res.status(200).json(response);
  });
});

/* If the client already has a valid access token he can login */
router.post('/session',function(req,res){
  var response = {}
  if(req.decoded){
    response.success = true;
  }else{
    response.success = false;
  }
  res.send(response);
});

function checkusername (usr) {
  return usr.username == this.username;
}

function findForCredentials (usr) {
  return ((usr.username == this.credentials || usr.email == this.credentials)
  && bcrypt.compareSync(this.password, usr.password));
}

function findForId (usr) {
  return usr.id == this.id;
}

/* Writes in the user-db */
function usersUpdate(){
  fs.writeFileSync(path.join(__dirname, '../storage/users.json'), JSON.stringify(users));
}

module.exports = router;
