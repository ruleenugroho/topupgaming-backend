var express = require('express');
var router = express.Router();
const { landingPage, detailPage, category, checkout, history, historyDetail, dashboard, profile, editProfile, getImage } = require('./controller');
const { isLoginPlayer } = require('../middleware/auth')
const multer = require('multer');


/* GET home page. */
router.get('/landingpage', landingPage);
router.get('/:id/detail', detailPage);
router.get('/category', category);
router.post('/checkout', isLoginPlayer, checkout);
router.get('/history', isLoginPlayer, history);
router.get('/history/:id/detail', isLoginPlayer, historyDetail);
router.get('/dashboard', isLoginPlayer, dashboard);
router.get('/profile', isLoginPlayer, profile);
router.put('/profile', isLoginPlayer, multer({ dest: './public/uploads/' }).single('image'), editProfile);
router.get('/images/:key', getImage);

module.exports = router;
