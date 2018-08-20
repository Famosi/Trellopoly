var express = require('express');
var path = require('path');
var fs = require('fs');

var router = express.Router();

router.use('/trello', require('./trello'));

module.exports = router;
