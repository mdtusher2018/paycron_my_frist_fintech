// transactionController.js


const User = require('../models/user_model');  // Your user model (adjust path as needed)
const Transaction = require('../models/transaction_model'); // Adjust path for your transaction model
const {
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
} = require("../config/secret");
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const balanceController = require('./balanceController');


exports.createTransaction = async (
  senderId,
  receiverId,
  type,
  amount,
  status = "Completed",
  method = "Initial Bonus",
  session = null,
  purpose="No Purpose"
) => {
  const transaction = new Transaction({
    sender: senderId,
    receiver: receiverId,
    transaction_type: type,
    amount,
    status,
    payment_method: method,
    purpose:purpose
  });

  if (session) {
    await transaction.save({ session });
  } else {
    await transaction.save();
  }

  return transaction;
};



exports.transferMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receiverEmail, amount, purpose="No Purpose", pin } = req.body;
    const senderId = req.user.id;




    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    if (!pin) throw new Error("PIN is required");

    const sender = await User.findById(senderId).session(session);
    if (!sender) throw new Error("Sender not found");


    const isPinValid = await sender.comparepin(pin);
    if (!isPinValid) throw new Error("Invalid PIN. Transaction aborted.");


    const receiver = await User.findOne({
      email: receiverEmail.toLowerCase().trim(),
    }).session(session);

    if (!receiver) throw new Error("Receiver not found");

    if (receiver._id.toString() === sender._id.toString()) {
      throw new Error("You cannot send money to yourself");
    }

    // ✅ Deduct sender
    await balanceController.removeBalanceWithSession(
      sender._id,
      amount,
      session
    );

    // ✅ Add to receiver
    await balanceController.addBalanceWithSession(
      receiver._id,
      amount,
      session
    );

    // ✅ Create transaction record
    await this.createTransaction(
      sender._id,
      receiver._id,
      "Send Money",
      amount,
      "Completed",
      "Wallet Transfer",
      session,
      purpose
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      status: true,
      message: "Money transferred successfully",
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(400).json({
      status: false,
      message: error.message,
    });
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
  const { amount, currency } = req.body;
  const userId = req.user.id;


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

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id

    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook signature verification failed.');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    await handleSuccessfulPayment(paymentIntent);
  }

  res.send({ received: true });
};


const handleSuccessfulPayment = async (paymentIntent) => {

  const userId = paymentIntent.metadata.user_id;
  const amount = paymentIntent.amount_received / 100;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTransaction = await Transaction.findOne({
      paymentIntentId: paymentIntent.id,
      status: "Completed",
    }).session(session);

    if (existingTransaction) {
      console.log("Payment already processed");
      await session.commitTransaction();
      session.endSession();
      return;
    }

    let balance = await balanceController.getBalanceForSession(userId, session);
    if (!balance) {
      balance = await balanceController.createBalanceForSession(userId, amount, session);
    } else {
      balance.balance_amount += amount;
      await balance.save({ session });
    }

    await Transaction.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { status: "Completed", amount },
      { session, new: true }
    );

    await session.commitTransaction();
    session.endSession();

    console.log("Payment processed successfully");

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error processing payment:", err);
    throw err;
  }
};