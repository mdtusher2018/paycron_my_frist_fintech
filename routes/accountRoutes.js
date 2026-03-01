const express = require('express');
const router = express.Router();
const controller = require('../controllers/accountController');
const { authrized } = require('../middleware/authmiddleware');

// @route   POST /auth/signup
router.get('/get-profile',authrized, controller.getMyProfile);




module.exports = router;
