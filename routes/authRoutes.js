const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /auth/signup
router.post('/signup', authController.signup);

// @route   POST /auth/signin
router.post('/signin', authController.signin);

// @route   POST /auth/email-verification
router.post('/email-verification', authController.verifyEmailWithOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
