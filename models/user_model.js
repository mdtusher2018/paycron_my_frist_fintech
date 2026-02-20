const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: false
  },
  last_name: {
    type: String,
    required: false
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  pin: {
    type: String,
    required: true
  },
  profile_picture: {
    type: String,
    required: false
  },
  account_status: {
    type: String,
    enum: ['Active', 'Pending', 'Verified', 'Suspended'],
    default: 'Pending'
  },

  role: {
    type: String,
    enum: ['User', 'Merchant', 'Admin'],
    default: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// ✅ Compare pin method
UserSchema.methods.comparepin = async function (candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};
UserSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;