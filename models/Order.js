const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        flowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flower' },
        quantity: Number,
        price: Number
      }
    ],
    total: Number,
    status: { type: String, default: 'заказ оформлен' },
    createdAt: { type: Date, default: Date.now }
  });
  orderSchema.index({ userId: 1, createdAt: -1 });
  module.exports = mongoose.model('Order', orderSchema);