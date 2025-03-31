const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  blocked: { type: Boolean, default: false, required: true },
  balance: { type: Number, default: 10000 }, // Changed to Number
  userNumber: { type: Number, default: 1 }   // Changed to Number
});

module.exports = mongoose.model('User', UserSchema);
