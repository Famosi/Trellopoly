var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs'); /* Used for crypt and decrypt passwd users */
var jwt = require('jsonwebtoken');
var fetch = require('node-fetch');
var https = require('https');
var express = require('express');

var router = express.Router();

var tasks_accept = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage/user-accept.json'), 'utf8'));
var tasks_delete = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage/user-delete.json'), 'utf8'));


var pendingTask = {}

router.post('/accept',function(req, res){

  console.log("accept..");

  var usrReq = req.body;
  var response = { success: true };

  var pndTask = {
    "ID" : usrReq.id,
    "issuer" : usrReq.issuer,
    "type" : usrReq.type,
   	"lat" : usrReq.lat,
   	"lon" : usrReq.lon,
   	"radius" : usrReq.radius,
   	"duration" : usrReq.duration,
   	"what" : usrReq.what
  }

  pendingTask[usrReq.username] = pndTask;

  if(tasks_accept[usrReq.username] == undefined){
    tasks_accept[usrReq.username] = []
  }

  console.log(tasks_accept[usrReq.username]);

  tasks_accept[usrReq.username].push(pendingTask[usrReq.username]);

  delete pendingTask[usrReq.username]

  response.username = usrReq.username

  taskAcceptUpdate()

  res.status(200).json(response);
});

router.get('/accept*', function(req, res) {
  var response = {}
  var username = req.query.username;

  var user

  console.log(username);

  if(tasks_accept[username] != undefined){
    user = username
  } else {
    user = "default"
  }
  
  res.status(200).json(tasks_accept[user])

});

router.post('/delete', function(req, res) {

  var usrReq = req.body
  var id = usrReq.id
  var pndTask = {
    "ID" : usrReq.id
  }

  pendingTask[usrReq.username] = pndTask;

  if(tasks_delete[usrReq.username] == undefined){
    tasks_delete[usrReq.username] = []
  }

  console.log(tasks_delete[usrReq.username]);

  tasks_delete[usrReq.username].push(pendingTask[usrReq.username]);

  delete pendingTask[usrReq.username]

  if (tasks_accept[usrReq.username] != undefined) {
    index = tasks_accept[usrReq.username].findIndex(function (item, i) {
      return item.ID == id
    });
    tasks_accept[usrReq.username].splice(index, 1);
  }

  taskAcceptUpdate()
  tasksDeleteUpdate()

  res.status(200).json(tasks_delete[usrReq.username])
});

router.get('/delete*', function(req, res) {
  var response = {}
  var username = req.query.username;

  console.log(username);

  if(tasks_delete[username] != undefined){
    res.status(200).json(tasks_delete[username])
  } else {
    res.status(200).json(tasks_delete["default"])
  }
});


/* Writes in the annotations-db */
function taskAcceptUpdate(){
  fs.writeFileSync(path.join(__dirname, '../storage/user-accept.json'), JSON.stringify(tasks_accept));
}

function tasksDeleteUpdate(){
  fs.writeFileSync(path.join(__dirname, '../storage/user-delete.json'), JSON.stringify(tasks_delete));
}

module.exports = router;
