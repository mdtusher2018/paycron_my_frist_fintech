const express = require('express');
const router = express.Router();
const controller = require('../controllers/accountController');

// @route   POST /auth/signup
router.post('/get-profile', controller.getMyProfile);




module.exports = router;
