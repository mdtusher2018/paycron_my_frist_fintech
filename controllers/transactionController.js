// transactionController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Your Stripe secret key
const User = require('../models/user_model');  // Your user model (adjust path as needed)
const Transaction = require('../models/transaction_model'); // Adjust path for your transaction model

// Deposit request: create payment intent
exports.createDeposit = async (req, res) => {
    const { userId, amount } = req.body; // Get user and amount from request

    try {
        // Check if the user exists in the system
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Create a PaymentIntent with Stripe API
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,  // Convert to the smallest unit (e.g., cents for USD)
            currency: 'usd',  // You can change the currency
            metadata: { user_id: userId },
        });

        // Save the transaction request to your DB if needed (optional)
        const transaction = new Transaction({
            userId,
            amount,
            status: 'pending',
            paymentIntentId: paymentIntent.id,
        });

        await transaction.save();

        // Send the clientSecret to the Flutter app to confirm the payment
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// transactionController.js

exports.handlePaymentSuccess = async (req, res) => {
    const { payment_intent } = req.query; // Get payment_intent from the URL query params

    try {
        // Retrieve the PaymentIntent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

        if (paymentIntent.status === 'succeeded') {
            // Payment successful, update the user balance

            const userId = paymentIntent.metadata.user_id;  // Get userId from metadata
            const amount = paymentIntent.amount_received / 100;  // Convert back to dollars/currency

            // Update user balance in your database (adjust your schema as needed)
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Add the deposited amount to the user's balance
            user.balance += amount;
            await user.save();

            // Optionally, mark the transaction as completed
            const transaction = await Transaction.findOneAndUpdate(
                { paymentIntentId: paymentIntent.id },
                { status: 'completed', amount: amount },
                { new: true }
            );

            res.status(200).json({ message: 'Payment successful, balance updated' });
        } else {
            res.status(400).json({ error: 'Payment failed' });
        }
    } catch (error) {
        console.error('Error processing payment success:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
/*
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class DepositService {
  static Future<void> createDeposit(double amount) async {
    final response = await http.post(
      Uri.parse('https://your-backend-url.com/create-deposit'),
      body: json.encode({'userId': 'user_id', 'amount': amount}),
      headers: {'Content-Type': 'application/json'},
    );

    final data = json.decode(response.body);
    final clientSecret = data['clientSecret'];

    // Confirm the payment with the Stripe clientSecret
    await Stripe.instance.confirmPayment(
      clientSecret,
      PaymentMethodParams.card(),
    );
  }
}
*/
