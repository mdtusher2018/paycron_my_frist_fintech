const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { authrized } = require("../middleware/authmiddleware");
/**
 * @swagger
 * /transaction/transfer:
 *   patch:
 *     summary: Transfer money from authenticated user to another user
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Money transfer details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *                 example: 64f8f0c2b0d3c2a1f4e12345
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Money transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Money transferred successfully
 *       400:
 *         description: Validation or user errors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Sender not found
 */

router.patch("/transfer", authrized, transactionController.transferMoney);

/**
 * @swagger
 * /transaction/transactions:
 *   get:
 *     summary: Get all transactions for the authenticated user
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
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
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sender:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                       receiver:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                       transaction_type:
 *                         type: string
 *                         example: Deposit
 *                       amount:
 *                         type: number
 *                         example: 1000
 *                       status:
 *                         type: string
 *                         example: Completed
 *                       payment_method:
 *                         type: string
 *                         example: Stripe
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */

router.get('/my-transactions', authrized, transactionController.getMyTransactions);

/**
 * @swagger
 * /transaction/create-deposit:
 *   post:
 *     summary: Create a deposit transaction using Stripe
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Deposit details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               currency:
 *                 type: string
 *                 example: BDT
 *     responses:
 *       200:
 *         description: Stripe payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   example: pi_3KmXxx123_secret_abc456
 *       400:
 *         description: User not found or invalid request
 *       500:
 *         description: Internal server error
 */
router.post('/create-deposit', authrized, transactionController.createDeposit);

/**
 * @swagger
 * /transaction/deposit-sucess:
 *   post:
 *     summary: Stripe webhook to handle successful payments
 *     tags:
 *       - Transactions
 *     requestBody:
 *       description: Raw Stripe webhook payload
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received and processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Webhook signature verification failed
 */
router.post('/deposit-sucess', authrized, transactionController.stripeWebhook);

// 1️⃣ Send a money request (requires PIN verification)
router.post('/request-money', authrized, transactionController.requestMoney);

// 2️⃣ Get requests I sent
router.get('/requests-sent', authrized, transactionController.getSentRequests);

// 3️⃣ Get requests I received
router.get('/requests-received', authrized, transactionController.getReceivedRequests);

// 4️⃣ Approve a pending request (requires PIN)
router.post('/requests-approve', authrized, transactionController.approveRequest);

// 5️⃣ Reject a pending request
router.post('/requests-reject', authrized, transactionController.rejectRequest);





module.exports = router;