const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const kycUpload = require("../middleware/multiple_upload");
const { authrized, adminOnly } = require('../middleware/authmiddleware');

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

// Get all pending request
router.get(
  "/pending-accounts",
  authrized,
  verificationController.getPendingIdentities
);
// Approve specific document
router.patch(
  "/identity/approve/:userId/:documentId",
  authrized,
  verificationController.approveIdentity
);

// Reject specific document
router.patch(
  "/identity/reject/:userId/:documentId",
  authrized,
  verificationController.rejectIdentity
);

module.exports = router;
