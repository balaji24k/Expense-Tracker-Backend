const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '1h' 
  }
});

module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema);
