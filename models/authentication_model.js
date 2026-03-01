const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AuthenticationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  email_verified: {
    type: Boolean,
    default: false
  },

  identity_status: {
    type: String,
    enum: ["NotSubmitted", "Pending", "Approved", "Rejected"],
    default: "NotSubmitted"
  },

  identity_documents: [
    {
      document_type: {
        type: String,
        enum: ["NID", "Passport", "DrivingLicense", "Other"]
      },
      document_url: String,
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
      },
      rejection_reason: String,
      submitted_at: {
        type: Date,
        default: Date.now
      },
      reviewed_at: Date
    }
  ]

}, { timestamps: true });

const Authentication = mongoose.model('Authentication', AuthenticationSchema);

module.exports = Authentication;