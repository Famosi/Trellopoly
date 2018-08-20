var express = require('express');
var request = require('request');
var router = express.Router();

router.get("/o/:organization", function(req, res) {
  var options = {
    method: 'GET',
    url: 'https://api.trello.com/1/organizations/' + req.params.organization + '/boards',
    qs: {
      key: '4dd8f72d0f8b9dfb50ac4131b768ff3d',
      token: '7b78067d9d2da7059ada476d5ee24d7f70f64929bffb2ed8aec54abcb153f59c'
    }
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });

})

module.exports = router;
