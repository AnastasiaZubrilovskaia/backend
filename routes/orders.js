const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Flower = require('../models/Flower');
const authorize = require('../middleware/authorize');

router.get('/', authorize(['manager', 'admin']), async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .populate('items.flowerId');
  res.json(orders);
});

router.get('/me', authorize(['customer']), async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate('items.flowerId');
  res.json(orders);
});

router.post('/', authorize(['customer']), async (req, res) => {
  try {
    const { items } = req.body;
    
    // Check stock availability and calculate total
    let total = 0;
    for (const item of items) {
      const flower = await Flower.findById(item.flowerId);
      if (!flower) {
        return res.status(400).json({ message: `Цветок с ID ${item.flowerId} не найден` });
      }
      if (flower.stock < item.quantity) {
        return res.status(400).json({ message: `Товар "${flower.name}" закончился на складе` });
      }
      total += item.quantity * item.price;
    }

    // Create order
    const order = new Order({ 
      userId: req.user._id, 
      items, 
      total,
      status: 'заказ оформлен'
    });
    await order.save();

    // Update stock
    for (const item of items) {
      await Flower.findByIdAndUpdate(item.flowerId, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
});

module.exports = router;