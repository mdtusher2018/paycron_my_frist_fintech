const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthenticationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  identity_verified: {
    type: Boolean,
    default: false
  },
  verification_date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Authentication = mongoose.model('Authentication', AuthenticationSchema);

module.exports = Authentication;