var express = require('express');
var path = require('path');
var api = require('./routes/main');
const http = require('http');
var WebSocket = require('ws')

var app = express();

app.use(express.static(path.join(__dirname, 'Public'))); /* Public folder is served staticaly */

app.use('/api', api); /* redirect to routes */
app.use('/*', express.static(path.join(__dirname, 'Public')));

server = http.createServer(app);

//initialize the WebSocket server instance
app.set('wss', new WebSocket.Server({ server }))

wss.broadcast = function broadcast(msg) {
     console.log(msg);
     wss.clients.forEach(function each(client) {
       client.send(msg);
     });
    };


app.listen(8000, function () {
  console.log('Trellopoly listening on port 8000!');
});

module.exports = app;
