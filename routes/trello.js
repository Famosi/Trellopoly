var express = require('express');
var request = require('request');
var router = express.Router();


//Get user organizations
router.get("/organization*", function(req, res) {
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/members/me' + '/organizations/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: req.query.token
    }
  };

  request(options, function (error, response, body) {
    var rsp = {}
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    if (checkOrg(data, req.query.organization)) {
      if (getBoards(req.query.organization, req.query.token)) {
        rsp.success = true;
        rsp.message = "Ok to play!";
        res.status(200).json(rsp);
      }
    } else {
      rsp.success = false;
      rsp.message = "You are not a member of this Organization";
      res.status(200).json(rsp);
    }
  });
})

router.get("/board*", function(req, res) {
  var rsp = {};
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/organization/' +  req.query.organization + '/boards/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: req.query.token
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    rsp.success = true;
    rsp.message = "Your Boards";
    rsp.data = data;
    res.status(200).json(rsp)
  });
})

//Get logged user boards
function getBoards(organization, token) {
  var play = true
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/organization/' +  organization + '/boards/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var boards = JSON.parse(body);
    if (!checkBoards(boards, token)) {
      play = false
    }
  });
  return play
}

//Check if Boards are ok
function checkBoards(boards, token) {
  var play = true
  for (var i = 0; i < boards.length; i++) {
    var options = {
      method: 'GET',
      url: 'https://api.trello.com/1/boards/' +  boards[i].id + '/lists?filter=open',
      qs: {
        key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
        token: token
      }
    };
    if (boards[i].name == "Scatola") {
      if (!checkScatola(options, token)) {
        play = false
      }
    } else {
      if (!checkPlayer(options, token)){
        play = false
      }
    }
  }
  return play
}

//Check if Board is ok
function checkScatola(options, token) {
  console.log("Check Scatola...");
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var lists = JSON.parse(body);
    var play = true
    for (var i = 0; i < lists.length; i++) {
      if (lists[i].name != "Plancia" && lists[i].name != "Contratti" && lists[i].name != "Imprevisti/Probabilità" && lists[i].name != "Banca" && lists[i].name != "Istruzioni" ) {
        var play = false
      }
    }
    if (play) {
      console.log("Ok Scatola!");
      return true
    } else {
      console.log("Can't Play");
      return false
    }
  });
}

//Check if Board is ok
function checkPlayer(options, token) {
  console.log("Check Player...");
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var lists = JSON.parse(body);
    var play = true
    for (var i = 0; i < lists.length; i++) {
      if (lists[i].name != "Contratti" && lists[i].name != "Posizione" && lists[i].name != "Soldi") {
        var play = false
      }
    }
    if (play) {
      console.log("Ok Player!");
      return true
    } else {
      console.log("Can't Play");
      return false
    }
  });
}

//Check if user is member of this organization
function checkOrg(data, organization) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].name == organization) {
      console.log("Ok Organization!");
      return true
    }
  }
  return false
}


module.exports = router;
