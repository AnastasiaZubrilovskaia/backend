const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const authorize = require('../middleware/authorize');

router.get('/sales-by-category', authorize(['admin']), async (req, res) => {
  const result = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'flowers',
        localField: 'items.flowerId',
        foreignField: '_id',
        as: 'flower'
      }
    },
    { $unwind: '$flower' },
    {
      $group: {
        _id: '$flower.category',
        totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        totalItems: { $sum: '$items.quantity' }
      }
    }
  ]);
  res.json(result);
});

router.get('/top-customers', authorize(['admin']), async (req, res) => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: '$userId',
        totalSpent: { $sum: '$total' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 }
  ]);

  // Get user details for each customer
  const customersWithDetails = await Promise.all(
    result.map(async (customer) => {
      const user = await User.findById(customer._id);
      return {
        ...customer,
        name: user.name,
        email: user.email
      };
    })
  );

  res.json(customersWithDetails);
});

router.get('/orders-by-day', authorize(['admin']), async (req, res) => {
  const result = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        total: { $sum: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  res.json(result);
});

module.exports = router;