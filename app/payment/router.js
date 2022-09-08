var express = require('express');
var router = express.Router();
const { index, viewCreate, actionCreate, viewEdit, actionEdit, actionDelete, actionStatus } = require('./controller');

/* GET home page. */
router.get('/', index);
router.get('/create', viewCreate);
router.post('/create', actionCreate);
router.get('/:id/edit', viewEdit);
router.put('/:id/edit', actionEdit);
router.delete('/:id/delete', actionDelete);
router.put('/:id/editStatus', actionStatus);

module.exports = router;
