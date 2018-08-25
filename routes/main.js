var express = require('express');
var path = require('path');
var fs = require('fs');

var router = express.Router();

router.use('/game', require('./game'));
router.use('/init', require('./init'));


module.exports = router;
