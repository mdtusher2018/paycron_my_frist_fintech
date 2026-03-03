const express = require('express');
const router = express.Router();
const balanceController = require('../controllers/balanceController');
const { authrized } = require('../middleware/authmiddleware');
/**
 * @swagger
 * /balance/my-balance:
 *   get:
 *     summary: Get the authenticated user's balance
 *     tags:
 *       - Balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 balance:
 *                   type: number
 *                   example: 1500
 *                 currency:
 *                   type: string
 *                   example: BDT
 *       404:
 *         description: Balance record not found for this user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Balance record not found for this user
 *       500:
 *         description: Failed to fetch balance due to server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch balance
 *                 error:
 *                   type: string
 *                   example: Internal server error details
 */
router.get('/my-balance', authrized, balanceController.getMyBalance);


module.exports = router;