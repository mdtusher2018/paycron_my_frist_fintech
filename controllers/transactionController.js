// transactionController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Your Stripe secret key
const User = require('../models/user_model');  // Your user model (adjust path as needed)
const Transaction = require('../models/transaction_model'); // Adjust path for your transaction model


// Deposit request: create payment intent
exports.createDeposit = async (req, res) => {
    const { userId, amount,currency } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: currency,  
            payment_method_types: ['card'],
            metadata: { user_id: userId },
        });

        const transaction = new Transaction({
            userId,
            amount,
            status: 'pending',
            paymentIntentId: paymentIntent.id,
        });

        await transaction.save();

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.handlePaymentSuccess = async (req, res) => {
    const { payment_intent } = req.query;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

        if (paymentIntent.status === 'succeeded') {
    

            const userId = paymentIntent.metadata.user_id; 
            const amount = paymentIntent.amount_received / 100;  

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.balance += amount;
            await user.save();

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

Future<void> startCardPayment(BuildContext context, String amount) async {
  // Step 1: Get the clientSecret from your backend
  final response = await http.post(
    Uri.parse("https://your-backend.com/create-payment-intent"),
    body: jsonEncode({
      "amount": amount,
      "currency": "usd",
    }),
  );
  final paymentIntentData = jsonDecode(response.body);

  // Step 2: Initialize PaymentSheet with clientSecret
  await Stripe.instance.initPaymentSheet(
    paymentSheetParameters: SetupPaymentSheetParameters(
      paymentIntentClientSecret: paymentIntentData['clientSecret'],
      merchantDisplayName: 'Your Merchant Name',
    ),
  );

  // Step 3: Present the PaymentSheet
  await Stripe.instance.presentPaymentSheet();
}



*/
