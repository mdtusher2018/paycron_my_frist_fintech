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

  date_of_birth: {
    type: Date,
    required: false
  },
  address: {
    road: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    postal_code: { type: String, required: false },
    country: { type: String, required: false },
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
    default: 'Active'
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


  // Update profile_completed
  const dobFilled = !!this.date_of_birth;
  const address = this.address || {};
  const addressFilled =
    !!address.road &&
    !!address.city &&
    !!address.state &&
    !!address.postal_code &&
    !!address.country;

  this.profile_completed = dobFilled && addressFilled;




  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;