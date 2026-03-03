const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Account Management APIs
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register user and send OTP
 *     description: Generates a temporary token containing OTP for email verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pin
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               pin:
 *                 type: string
 *                 example: 1234
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent to your email. Please verify.
 *                 token:
 *                   type: string
 *                   example: jwt_token_here
 *       400:
 *         description: Email already registered or validation error
 *       500:
 *         description: Server error
 */
router.post('/signup', authController.signup);


/**
 * @swagger
 * /auth/email-verification:
 *   post:
 *     summary: Verify email using OTP
 *     description: Verifies OTP using temporary token and creates user account.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Email verified and account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid OTP or expired token
 *       401:
 *         description: Token missing or malformed
 */
router.post('/email-verification', authController.verifyEmailWithOTP);


/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: User login
 *     description: Authenticates user and returns access & refresh tokens.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pin
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               pin:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                   example: 200
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid email or pin
 *       401:
 *         description: Email not verified
 *       500:
 *         description: Server error
 */
router.post('/signin', authController.signin);


module.exports = router;
