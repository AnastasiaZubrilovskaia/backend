const express = require('express');
const router = express.Router();
const Flower = require('../models/Flower');
const authorize = require('../middleware/authorize');

router.get('/', async (req, res) => {
  const flowers = await Flower.find();
  res.json(flowers);
});

router.post('/', authorize(['admin', 'manager']), async (req, res) => {
  const flower = new Flower(req.body);
  await flower.save();
  res.status(201).json(flower);
});

router.put('/:id', authorize(['admin', 'manager']), async (req, res) => {
  const flower = await Flower.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(flower);
});

router.delete('/:id', authorize(['admin']), async (req, res) => {
  await Flower.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;