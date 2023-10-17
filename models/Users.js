const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  isPremiumUser: {
    type: Boolean,
    default: false
  },
  expenses: [
    {
      type: Schema.Types.ObjectId,
      ref: "Expense"
    }
  ],
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order"
    }
  ],
  forgotPasswords: [
    {
      type: Schema.Types.ObjectId,
      ref: "ForgotPassword"
    }
  ],
  downloadLists: [
    {
      type: Schema.Types.ObjectId,
      ref: "DownloadList"
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
