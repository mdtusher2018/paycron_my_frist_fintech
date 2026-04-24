const express = require("express");
const router = express.Router();
const cardController = require("../controllers/payment_managment");
const { authrized } = require("../middleware/authmiddleware");


// ======================================================
// 1️⃣ CREATE SETUP INTENT (ADD CARD)
// ======================================================
/**
 * @swagger
 * /payment-managment/setup-intent:
 *   post:
 *     summary: Create Stripe SetupIntent for saving a card
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SetupIntent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *                   example: seti_123_secret_abc
 *       500:
 *         description: Server error
 */
router.post(
  "/setup-intent",
  authrized,
  cardController.createSetupIntent
);




// ======================================================
// 3️⃣ GET SAVED CARDS
// ======================================================
/**
 * @swagger
 * /payment-managment/list:
 *   get:
 *     summary: Get all saved cards for user
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get(
  "/list",
  authrized,
  cardController.getSavedCards
);


// ======================================================
// 4️⃣ SET DEFAULT CARD
// ======================================================
/**
 * @swagger
 * /payment-managment/default:
 *   post:
 *     summary: Set default payment method
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 example: pm_123456789
 *     responses:
 *       200:
 *         description: Default card updated
 */
router.post(
  "/default",
  authrized,
  cardController.setDefaultCard
);


// ======================================================
// 5️⃣ DELETE CARD
// ======================================================
/**
 * @swagger
 * /payment-managment/delete:
 *   delete:
 *     summary: Delete a saved card
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 example: pm_123456789
 *     responses:
 *       200:
 *         description: Card deleted successfully
 *       400:
 *         description: Invalid request
 */
router.delete(
  "/delete",
  authrized,
  cardController.deletePaymentMethod
);


module.exports = router;