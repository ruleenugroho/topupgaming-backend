var express = require('express');
var router = express.Router();
const { index, viewCreate, actionCreate, viewEdit, actionEdit, actionDelete, actionStatus } = require('./controller');
const multer = require('multer');
const os = require('os');

/* GET home page. */
router.get('/', index);
router.get('/create', viewCreate);
router.post('/create', multer({ dest: os.tmpdir() }).single('image'), actionCreate);
router.get('/:id/edit', viewEdit);
router.put('/:id/edit', multer({ dest: os.tmpdir() }).single('image'), actionEdit);
router.delete('/:id/delete', actionDelete);
router.put('/:id/editStatus', actionStatus);

module.exports = router;
