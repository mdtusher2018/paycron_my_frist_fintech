const express = require("express");
const router = express.Router();
const transactionControllerr = require("../controllers/transactionController");

router.post("/stripe/webhook",
    express.raw({ type: "application/json" }), transactionControllerr.stripeWebhook);

module.exports = router;