const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['customer', 'manager', 'admin'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);