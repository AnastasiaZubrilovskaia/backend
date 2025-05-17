const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authorize = require('../middleware/authorize');

router.get('/', authorize('admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;