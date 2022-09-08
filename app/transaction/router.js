var express = require('express');
var router = express.Router();
const { index, actionStatus } = require('./controller');

/* GET home page. */
router.get('/', index);
router.put('/status/:id', actionStatus);


module.exports = router;
