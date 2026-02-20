const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  pin: {
    type: Number,
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
  role:{
     type: String,
    enum: ['User', 'Marchent', 'Admin'],
    default: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;