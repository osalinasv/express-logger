const express = require('express');
const router = express.Router();

const log = require('../controllers/log')

router.post('', log.create)
router.delete('', log.delt)
router.get('', log.get)

module.exports = router;
