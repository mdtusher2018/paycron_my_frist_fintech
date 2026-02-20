const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BalanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balance_amount: {
    type: Number,
    required: true,
    default: 0.00
  },
  currency: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Balance = mongoose.model('Balance', BalanceSchema);

module.exports = Balance;