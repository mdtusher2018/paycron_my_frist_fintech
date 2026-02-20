// transactionController.js


const User = require('../models/user_model');  // Your user model (adjust path as needed)
const Transaction = require('../models/transaction_model'); // Adjust path for your transaction model
const {
  STRIPE_SECRET_KEY,
} = require("../config/secret");
const stripe = require('stripe')(STRIPE_SECRET_KEY);

const mongoose = require("mongoose");
const balanceController = require('./balanceController');


exports. createTransaction= async (senderId, receiverId, type, amount, status = 'Completed', method = 'Initial Bonus')=> {
  const transaction = new Transaction({
    sender: senderId,
    receiver: receiverId,
    transaction_type: type,
    amount,
    status,
    payment_method: method,
  });

  await transaction.save();
}



exports.transferMoney =  async (req, res) => {
 const { receiverId, amount} = req.body;
 const senderId = req.user.id;

  const  paymentMethod = "Wallet Transfer"; 
  
 
  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender) throw new Error("Sender not found");
    if (!receiver) throw new Error("Receiver not found");

      await balanceController.addBalance(receiver._id, amount);
      await balanceController.removeBalance(sender._id, amount);

      this.createTransaction(
        sender._id,receiver._id,"Send Money",amount,"Completed",paymentMethod,
      );
      return res.status(200).json({
      status: true,
      message: "Money transferred successfully",
    
    });
  } catch (error) {
    throw error;
  }
};




exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    })
    .sort({ createdAt: -1 }) // Most recent first
    .populate('sender', 'email role')   // optional, populate sender details
    .populate('receiver', 'email role'); // optional, populate receiver details

    return res.status(200).json({
      statusCode: 200,
      status: true,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};



exports.createDeposit = async (req, res) => {
  const {  amount, currency } = req.body;
const userId=req.user.id;


  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    // 1️⃣ Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      payment_method_types: ['card'],
      metadata: { user_id: userId },
    });

    // 2️⃣ Save Transaction in MongoDB
    const transaction = new Transaction({
      sender: user._id,
      receiver: user._id,          // self deposit
      transaction_type: "Deposit",
      amount,
      status: "Pending",           // matches enum in schema
      payment_method: "Stripe",
      paymentIntentId: paymentIntent.id,
    });

    await transaction.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Handle Stripe payment success
 */
exports.handlePaymentSuccess = async (req, res) => {
  const { payment_intent } = req.query;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

    if (paymentIntent.status === 'succeeded') {
      const userId = paymentIntent.metadata.user_id;
      const amount = paymentIntent.amount_received / 100;

      // ✅ Update user's balance
      let balance = await Balance.findOne({ user: userId });
      if (!balance) {
        balance = new Balance({ user: userId, balance_amount: 0, currency: paymentIntent.currency });
      }
      balance.balance_amount += amount;
      await balance.save();

      // ✅ Update transaction status
      const transaction = await Transaction.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: "Completed", amount },
        { new: true }
      );

      res.status(200).json({ message: 'Payment successful, balance updated', transaction });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error processing payment success:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};