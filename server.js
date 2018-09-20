var express = require('express');
var path = require('path');
var api = require('./routes/main');
const http = require('http');
var WebSocket = require('ws')

app = express();

app.use(express.static(path.join(__dirname, 'Public'))); /* Public folder is served staticaly */

app.use('/api', api); /* redirect to routes */
app.use('/*', express.static(path.join(__dirname, 'Public')));

var server = http.createServer(app);

//initialize the WebSocket server instance
wss = new WebSocket.Server({port: 40510})

app.set('wss', wss)

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message)
  })
  ws.send("Connected")
})

app.listen(8000, function () {
  console.log('Trellopoly listening on port 8000!');
});

module.exports = app;
