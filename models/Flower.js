const mongoose = require('mongoose');

const flowerSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    stock: Number,
    createdAt: { type: Date, default: Date.now }
  });
  flowerSchema.index({ name: 'text', category: 1, price: 1 });
  module.exports = mongoose.model('Flower', flowerSchema);