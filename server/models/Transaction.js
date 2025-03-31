const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  recipient: { type: String, required: true }, // Required field
  amount: { type: Number, required: true },
  transactionType: { type: String, enum: ['Online', 'ATM Withdrawal', 'POS Payment', 'Cryptocurrency', 'Wire Transfer'], required: true },
  location: { type: String },
  device: { type: String, enum: ['Unknown Device', 'Mobile', 'Desktop', 'ATM'] },
  ipAddress: { type: String },
  merchantCategory: { type: String, enum: ['Groceries', 'Gaming', 'Travel', 'Luxury Goods', 'Electronics', 'Retail'] },
  city: { type: String },
  accountType: { type: String, enum: ['Current', 'Credit', 'Savings'], required: true },
  Fraudulent_probability: { type: Number, required: true },
});

module.exports = mongoose.model('Transaction', TransactionSchema);