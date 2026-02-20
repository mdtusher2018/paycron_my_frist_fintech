const Balance = require('../models/balance_model');

exports.addBalance = async (userId, amount, currency = 'BDT') => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  let balance = await Balance.findOne({ user: userId });

  if (!balance) {
    balance = new Balance({
      user: userId,
      balance_amount: amount,
      currency,
    });
  } else {
    balance.balance_amount += amount;
  }

  await balance.save();
  return balance;
}
exports.removeBalance = async (userId, amount, currency = 'BDT') => {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  let balance = await Balance.findOne({ user: userId });

  if (!balance) {
    balance = new Balance({
      user: userId,
      balance_amount: amount,
      currency,
    });
  } else {
    if (balance.balance_amount < amount) {
      throw new Error("Insufficient balance");
    }
    balance.balance_amount -= amount;
  }

  await balance.save();
  return balance;
}


exports.getMyBalance = async (req, res) => {
  try {
    const balanceRecord = await Balance.findOne({ user: req.user.id });

    if (!balanceRecord) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "Balance record not found for this user",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      status: true,
      balance: balanceRecord.balance_amount,
      currency: balanceRecord.currency,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Failed to fetch balance",
      error: error.message,
    });
  }
};
