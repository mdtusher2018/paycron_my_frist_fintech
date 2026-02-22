const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Only required for send transactions or requests
  },
  transaction_type: {
    type: String,
    enum: ['Deposit', 'Send Money', 'Request Money'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    required: true
  },
  payment_method: {
    type: String, // Payment method used, e.g., 'Stripe'
    required: false
  },
  paymentIntentId: {
  type:String,
  required:false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;