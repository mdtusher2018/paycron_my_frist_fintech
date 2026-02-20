const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { authrized } = require('../middleware/authmiddleware');

router.get('/my-balance', authrized, balanceController.getMyBalance);


module.exports = router;