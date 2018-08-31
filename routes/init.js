var express = require('express');
var request = require('request');

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// increase the limit
myEmitter.setMaxListeners(15);

var idStartCard
var idListContrattiScatola
var cardIndex
var idBoardScatola

var nop
var organizations = {}

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

  request(options, function(error, response, body) {
    var rsp = {}
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    var org = req.query.organization
    var token = req.query.token
    if (checkOrg(data, req.query.organization)) {
      getBoards(req.query.organization, req.query.token, function(play) {
        if (play) {
          if (organizations.org != undefined) {
            if (organizations.org.noc == undefined) {
              organizations.org.noc = 1
            } else {
              if (organizations.org.players.find(x => x.id === token) == undefined) {
                organizations.org.noc += 1
              }
            }
            console.log("Organization: " + organizations.org);
            console.log("Number of players: " + organizations.org.nop);
            console.log("Number of connected: " + organizations.org.noc);

            if (organizations.org.noc == organizations.org.nop) {
              rsp.success = true;
              rsp.wait = false;
              rsp.message = "Inizializzo la partita...";
              sendBroadcast(rsp)
              res.status(200).json(rsp)
            } else if (organizations.org.noc < organizations.org.nop) {
              rsp.message = "Attendo giocatori...";
              rsp.success = true
              rsp.wait = true;
              sendBroadcast(rsp)
            } else {
              rsp.message = "La partita è gia iniziata";
              rsp.success = false
              res.status(200).json(rsp);
            }
          } else {
            rsp.message = "Errore interno, torna alla Home e riprova.";
            rsp.success = false
            res.status(200).json(rsp);
          }
        } else {
          console.log("Non è possibile giocare con questo gruppo, controlla le bacheche!");
          rsp.success = false;
          rsp.message = "Non è possibile giocare con questo gruppo, controlla le bacheche!";
          res.status(200).json(rsp);
        }
      })
    } else {
      rsp.success = false;
      rsp.message = "Sembra che tu non faccia parte di questo gruppo!";
      res.status(200).json(rsp);
    }
  });
})

function sendBroadcast(msg) {
  var wss = app.get("wss")
  wss.clients.forEach(function each(client) {
    client.send(msg.message);
  });
}

router.get("/initialize*", function(req, res) {
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/members/me' + '/organizations/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: req.query.token
    }
  };

  request(options, function(error, response, body) {
    var rsp = {}
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    console.log("========== init =======");
    idBoardScatola = data[0].idBoards[0]
    setIdStardCard(data[0].idBoards[0], req.query.token, function() {
      for (var i = 1; i < data[0].idBoards.length; i++) {
        setPosition(data[0].idBoards[i], i, req.query.token)
      }
    })
  });
});

router.get("/nop", function(req, res) {
  var org = req.query.organization
  var nop = req.query.nop
  var id = req.query.token
  if (organizations.org == undefined) {
    organizations.org = {}
  }
  if (organizations.org.players == undefined) {
    organizations.org.players = []
  }
  var pendingUsr = {
    id: id
  }
  if (organizations.org.players.find(x => x.id === id) == undefined) {
    organizations.org.players.push(pendingUsr)
  };
  organizations.org.nop = nop
});

router.get("/contratti*", function(req, res) {
  var rsp = {}
  var idBoard = req.query.boardId
  var token = req.query.token
  var idList

  var options = {
    method: 'GET',
    url: "https://api.trello.com/1/boards/" + idBoard + "/lists?filter=open",
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  }

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    idList = data[0].id

    initContratti(idList, token, function() {
      var optionsListContratti = {
        method: 'GET',
        url: "https://api.trello.com/1/lists/" + idListContrattiScatola + "/cards",
        qs: {
          key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
          token: token
        }
      }

      request(optionsListContratti, function(error, response, body) {
        if (error) throw new Error(error);
        var data = JSON.parse(body);
        var cardIndex
        for (var i = 0; i < 3; i++) {
          getCardIndex(data.length - i, function(cardIndex) {
            var optionsMove = {
              method: 'PUT',
              url: "https://api.trello.com/1/cards/" + data[cardIndex].id + "?idList=" + idList + "&idBoard=" + idBoard,
              qs: {
                key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
                token: token
              }
            };

            request(optionsMove, function(error, response, body) {
              if (error) throw new Error(error);
            });
          })

        }
        rsp.success = true;
        res.status(200).json(rsp);
      });
    });
  });
});

function initContratti(idList, token, callback) {
  //Get cards
  var options = {
    method: 'GET',
    url: "https://api.trello.com/1/lists/" + idList + "/cards",
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    moveContratti(idListContrattiScatola, data, idBoardScatola, token, function() {
      callback()
    })
  });
}

//All Player's contracts in Scatola
function moveContratti(idList, data, idBoard, token, callback) {
  for (var i = 0; i < data.length; i++) {
    var optionsMove = {
      method: 'PUT',
      url: "https://api.trello.com/1/cards/" + data[i].id + "?idList=" + idList + "&idBoard=" + idBoard,
      qs: {
        key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
        token: token
      }
    };

    request(optionsMove, function(error, response, body) {
      if (error) throw new Error(error);
      var data = JSON.parse(body);
    });
  }
  callback()
}

function getCardIndex(len, callback) {
  cardIndex = Math.floor(Math.random() * len) + 1;
  callback(cardIndex)
}

function setPosition(board, index, token) {
  var options = {
    method: 'GET',
    url: "https://api.trello.com/1/boards/" + board + "/lists?filter=open",
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    //All players in Start position
    for (var i = 0; i < data.length; i++) {
      if (data[i].name == "Posizione") {
        //Ho l'id della lista "posizione"
        archive(data[i].id, token)
        move(data[i].id, idStartCard, token)
      }
    }
  });
}

function move(idList, idCard, token) {
  var moveOptions = {
    method: 'POST',
    url: 'https://api.trello.com/1/cards?idCardSource=' + idCard + '&idList=' + idList,
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };
  request(moveOptions, function(error, response, body) {
    if (error) throw new Error(error);
  });
}

function setIdStardCard(idBoardScatola, token, callback) {
  var options = {
    method: 'GET',
    url: "https://api.trello.com/1/boards/" + idBoardScatola + "/lists?filter=open",
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };
  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    var data = JSON.parse(body);
    idListContrattiScatola = data[1].id
    //Get idStartCard
    var optionsPlancia = {
      method: 'GET',
      url: "https://api.trello.com/1/lists/" + data[0].id + "/cards",
      qs: {
        key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
        token: token
      }
    };
    request(optionsPlancia, function(error, response, body) {
      if (error) throw new Error(error);
      var cardsPlancia = JSON.parse(body);
      idStartCard = cardsPlancia[0].id
      callback()
    });
  });
}

function archive(idList, token) {
  var optionsPlancia = {
    method: 'GET',
    url: "https://api.trello.com/1/lists/" + idList + "/cards",
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };
  request(optionsPlancia, function(error, response, body) {
    if (error) throw new Error(error);
    var cards = JSON.parse(body);
    for (var i = 0; i < cards.length; i++) {
      var options = {
        method: 'PUT',
        url: 'https://api.trello.com//1/cards/' + cards[i].id + '/closed?value=true',
        qs: {
          key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
          token: token
        }
      };
      request(options, function(error, response, body) {
        if (error) throw new Error(error);
        var data = JSON.parse(body);
      });
    }
  });
}


//Get logged user boards
function getBoards(organization, token, callback) {
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/organization/' + organization + '/boards/',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    var boards = JSON.parse(body);
    checkBoards(boards, token, function(play) {
      callback(play)
    })
  });
}

var operations = 0
//Check if Boards are ok
function checkBoards(boards, token, callback) {
  operations = 0
  var len = boards.length
  for (var i = 0; i < boards.length; i++) {
    console.log(boards[i].name);
    var options = {
      method: 'GET',
      url: 'https://api.trello.com/1/boards/' + boards[i].id + '/lists?filter=open',
      qs: {
        key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
        token: token
      }
    };
    if (boards[i].name == "Scatola") {
      checkScatola(options, token, function(play) {
        console.log("Scatola can play: " + play);
        done(play, len, callback)
      })
    } else {
      checkPlayer(options, token, function(play) {
        console.log("Player can play: " + play);
        done(play, len, callback)
      })
    }
  }
}

function done(play, len, callback) {
  operations++
  console.log("len: " + len);
  console.log("operations: " + operations);
  if (operations == len) {
    console.log(play);
    callback(play)
  }
}



//Check if Board is ok
function checkScatola(options, token, callback) {
  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    var lists = JSON.parse(body);
    var play = true
    if (lists.length > 0) {
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].name != "Plancia" && lists[i].name != "Contratti" && lists[i].name != "Imprevisti/Probabilità" && lists[i].name != "Banca" && lists[i].name != "Istruzioni") {
          play = false
        }
      }
      if (play) {
        listPlanciaId = lists[0].id
      }
      callback(play)
    } else {
      callback(false)
    }
  });
}


//Check if Board is ok
function checkPlayer(options, token, callback) {
  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    var lists = JSON.parse(body);
    var play = true
    if (lists.length > 0) {
      for (var i = 0; i < lists.length; i++) {
        if (lists[i].name != "Contratti" && lists[i].name != "Posizione" && lists[i].name != "Soldi") {
          play = false
        }
      }
      callback(play)
    } else {
      callback(false)
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
