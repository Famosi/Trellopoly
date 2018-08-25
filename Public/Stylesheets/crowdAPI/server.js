var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var api = require('./routes/main');
var jwt = require('jsonwebtoken');

app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', function(req,res,next){
  var token = req.headers['x-access-token'];
  /* If the access token is valid, its decryption will be stored  */
  jwt.verify(token, 'cavallosolo', function(err, decoded) {
    if (err) {
      req.decoded = false;
      next();
    } else {
      req.decoded = decoded;
      next();
    }
  });
});

app.use('/api', api); /* redirect to routes */

var server = app.listen(8000, "0.0.0.0", function () {
  console.log('CrowdSense listening on port ' + server.address().port);
});

module.exports = app;
