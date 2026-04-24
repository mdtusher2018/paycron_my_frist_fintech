const User = require("../models/user_model");
const {
  STRIPE_SECRET_KEY
} = require("../config/secret");
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// ======================================================
// 1️⃣ CREATE SETUP INTENT (ADD CARD)
// ======================================================
exports.createSetupIntent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create Stripe Customer if not exists
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });

      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    return res.status(200).json({
      clientSecret: setupIntent.client_secret,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// 3️⃣ GET SAVED CARDS
// ======================================================
exports.getSavedCards = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res.json({ cards: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    return res.status(200).json({
      cards: paymentMethods.data,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// 4️⃣ SET DEFAULT CARD
// ======================================================
exports.setDefaultCard = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ message: "paymentMethodId is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ message: "Stripe customer missing" });
    }

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    user.defaultPaymentMethod = paymentMethodId;
    await user.save();

    return res.status(200).json({
      message: "Default card updated successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


// ======================================================
// 5️⃣ DELETE PAYMENT METHOD (SAFE VERSION)
// ======================================================
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ message: "paymentMethodId is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ message: "Stripe customer missing" });
    }

    // Check ownership (SECURITY FIX)
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: "card",
    });

    const ownsCard = paymentMethods.data.find(
      (pm) => pm.id === paymentMethodId
    );

    if (!ownsCard) {
      return res.status(403).json({ message: "You do not own this card" });
    }

    // Detach card
    await stripe.paymentMethods.detach(paymentMethodId);

    // If default card deleted → clear it
    if (user.defaultPaymentMethod === paymentMethodId) {
      user.defaultPaymentMethod = null;
      await user.save();
    }

    return res.status(200).json({
      message: "Card removed successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};