var express = require('express');
var request = require('request');
var router = express.Router();

var ScatolaBoardId //id board scatola

var listPlayerPositionId //id lista posizione in board giocatore
var listPlanciaId //id lista plancia in Scatola

var cardPlayerPosition //id card posizione attuale del giocatore


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
    if (!body.startsWith("unauthorized") && !body.startsWith("model")) {
      var data = JSON.parse(body);
      rsp.success = true;
      rsp.message = "Your Boards";
      rsp.data = data;
      res.status(200).json(rsp)
    } else {
      rsp.success = false;
      rsp.message = "Organization not found";
      res.status(200).json(rsp)
    }

  });
})

router.get("/position*", function(req, res) {
  ScatolaBoardId = req.query.id
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/boards/' +  ScatolaBoardId + '/lists/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: req.query.token
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    for (var i = 0; i < data.length; i++) {
      if (data[i].name == "Posizione") {
        listPlayerPositionId = data[i].id;
        var optionsCard = {
          method: 'GET',
          url: 'https://api.trello.com/1/lists/' +  listPlayerPositionId + '/cards/',
          qs: {
            key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
            token: req.query.token
          }
        };
        request(optionsCard, function (error, response, body) {
          if (error) throw new Error(error);
          var rsp = {};
          var data = JSON.parse(body);
          rsp.success = true;
          rsp.message = "Position: " + data[0].name;
          rsp.position = data[0].name;
          rsp.cardId = data[0].id;
          res.status(200).json(rsp);
        });
      }
    }
  });
})

router.get("/move*", function(req, res) {
  var rsp = {};
  console.log("moving..");
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/lists/' +  listPlanciaId + '/cards/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: req.query.token
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    var newPositionIndex = req.query.newPosition
    console.log(newPositionIndex);

    var newPositionId = data[newPositionIndex - 1].id

    //Move player
    var newPositionName = data[newPositionIndex - 1].name
    console.log("newPosition: " + newPositionName);

    var moveOptions = {
      method: 'POST',
      url: 'https://api.trello.com/1/cards?idCardSource=' + newPositionId + '&idList=' + listPlayerPositionId,
      qs: {
        key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
        token: req.query.token
      }
    };
    request(moveOptions, function (error, response, body) {
      if (error) throw new Error(error);
      var data = JSON.parse(body);
      rsp.success = true;
      rsp.newPosition = newPositionName;
      res.status(200).json(rsp);
    });
  });
})

router.get("/archive*", function(req, res) {
  var rsp = {};
  var options = {
    method: 'PUT',
    url: 'https://api.trello.com//1/cards/' + req.query.cardId + '/closed?value=true',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: req.query.token
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    console.log("Archived");
    rsp.success = true
    res.status(200).json(rsp);
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
      listPlanciaId = lists[0].id
      return true
    } else {
      console.log("Can't Play");
      return false
    }
  });
}

//Check if Board is ok
function checkPlayer(options, token) {
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
      return true
    }
  }
  return false
}


module.exports = router;
