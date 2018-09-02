var express = require('express');
var request = require('request');
var router = express.Router();

var ScatolaBoardId //id board scatola

var listPlayerPositionId //id lista posizione in board giocatore
var listPlanciaId //id lista plancia in Scatola

var cardPlayerPosition //id card posizione attuale del giocatore


router.get("/boards*", function(req, res) {
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

function sendBroadcast(msg) {
  var wss = app.get("wss")
  wss.clients.forEach(function each(client) {
    client.send(msg);
  });
}

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
  var org = req.query.organization
  var id = req.query.id
  var resultDice = req.query.resultDice

  var organizations = app.get("organizations")


  var indexName = organizations.org.findIndex(x => x.name === org)
  var indexId = organizations.org[indexName].players.findIndex(x => x.id === id)
  var indexTurn = (indexId + 1) % organizations.org[indexName].players.length

  var idTurn = organizations.org[indexName].players[indexTurn].id
  console.log(indexTurn);
  var brd = {
    'resultDice' : resultDice,
    'id' : idTurn.toString()
  }
  console.log(JSON.stringify(brd));
  sendBroadcast(JSON.stringify(brd))

  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/lists/' +  organizations.org[indexName].listPlanciaId + '/cards/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: req.query.token
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    var newPositionIndex = req.query.newPosition

    var newPositionId = data[newPositionIndex - 1].id

    //Move player
    var newPositionName = data[newPositionIndex - 1].name

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
    rsp.success = true
    res.status(200).json(rsp);
  });
})




module.exports = router;
