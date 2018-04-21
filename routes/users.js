const express = require('express');
const router = express.Router();

const user = require('../controllers/user')

router.post('', user.create)
router.post('/login', user.login)
router.get('/logout', user.logout)

module.exports = router;
