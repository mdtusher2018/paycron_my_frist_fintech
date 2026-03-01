const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const kycUpload = require("../middleware/multiple_upload");
const { authrized, adminOnly } = require('../middleware/authmiddleware');

router.post(
  "/identity/submit",
  authrized,
  kycUpload.single("document"),
  verificationController.submitIdentityVerification
);


/* ================= ADMIN ================= */

// Approve specific document
router.patch(
  "/identity/approve/:userId/:documentId",
  authrized,
  adminOnly,
  verificationController.approveIdentity
);

// Reject specific document
router.patch(
  "/identity/reject/:userId/:documentId",
  authrized,
  adminOnly,
  verificationController.rejectIdentity
);

module.exports = router;
