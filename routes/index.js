const express = require('express');
const router = express.Router();

const user = require('../controllers/user')

/* GET home page. */
router.get('/', (req, res, next) => res.render('index'));
router.get('/user', user.userProfile)
router.get('/admin', (req, res, next) => res.redirect('/admin/1'))
router.get('/admin/:page', user.adminProfile)

module.exports = router;
