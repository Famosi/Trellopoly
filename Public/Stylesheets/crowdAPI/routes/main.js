var express = require('express');
var path = require('path');
var fs = require('fs');

var router = express.Router();

router.use('/user', require('./user'));
router.use('/task', require('./task'));

module.exports = router;
