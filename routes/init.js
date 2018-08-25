var express = require('express');
var request = require('request');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
// increase the limit
myEmitter.setMaxListeners(15);

var idStartCard

var router = express.Router();

router.get("/initialize*", function (req, res) {
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
    console.log("========== init =======");
    for (var i = 0; i < data[0].idBoards.length; i++) {
      setPosition(data[0].idBoards[i], req.query.token)
    }
  });
});

function setPosition(board, token) {
  var options = {
    method: 'GET',
    url: "https://api.trello.com/1/boards/" +  board + "/lists?filter=open",
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: token
    }
  };

  request(options, function (error, response, body) {
    var rsp = {}
    if (error) throw new Error(error);
    var data = JSON.parse(body);

  });
}



module.exports = router;
