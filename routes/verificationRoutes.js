const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const kycUpload = require("../middleware/multiple_upload");
const { authrized, adminOnly } = require('../middleware/authmiddleware');

/**
 * @swagger
 * tags:
 *   name: Identity Verification
 *   description: Identity verification management APIs
 */

/**
 * @swagger
 * /identity/submit:
 *   post:
 *     summary: Submit identity verification documents
 *     tags: [Identity Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document_type
 *               - document
 *               - user_image
 *             properties:
 *               document_type:
 *                 type: string
 *                 example: National ID
 *               document:
 *                 type: string
 *                 format: binary
 *               user_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Identity document submitted successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/identity/submit",
  authrized,
  kycUpload.fields([
    { name: "document", maxCount: 1 },
    { name: "user_image", maxCount: 1 }
  ]),
  verificationController.submitIdentityVerification
);


/* ================= ADMIN ================= */

/**
 * @swagger
 * /pending-accounts:
 *   get:
 *     summary: Get all pending identity verification requests (Admin)
 *     tags: [Identity Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending identity requests
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/pending-accounts",
  authrized,
  verificationController.getPendingIdentities
);

/**
 * @swagger
 * /identity/approve/{userId}/{documentId}:
 *   patch:
 *     summary: Approve identity document (Admin)
 *     tags: [Identity Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64c9f1234567890abc123456
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         example: 64c9f9876543210abc123456
 *     responses:
 *       200:
 *         description: Identity verification approved
 *       404:
 *         description: User or document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch(
  "/identity/approve/:userId/:documentId",
  authrized,
  verificationController.approveIdentity
);

/**
 * @swagger
 * /identity/reject/{userId}/{documentId}:
 *   patch:
 *     summary: Reject identity document (Admin)
 *     tags: [Identity Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Blurry document image
 *     responses:
 *       200:
 *         description: Identity verification rejected
 *       404:
 *         description: User or document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch(
  "/identity/reject/:userId/:documentId",
  authrized,
  verificationController.rejectIdentity
);

module.exports = router;
