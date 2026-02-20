const express = require("express");
const router = express.Router();
const transactionControllerr = require("../controllers/transactionController");
const { authrized } = require("../middleware/authmiddleware");

router.patch("/transfer", authrized, transactionControllerr.transferMoney);

router.get('/transactions', authrized, transactionControllerr.getMyTransactions);
router.post('/create-deposit', authrized, transactionControllerr.createDeposit);

module.exports = router;