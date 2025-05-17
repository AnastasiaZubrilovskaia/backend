const express = require('express');
const router = express.Router();
const Flower = require('../models/Flower');
const { authenticateJWT } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const mongoose = require('mongoose');

// GET /api/flowers - Get all flowers
router.get('/', async (req, res) => {
  console.log('GET /api/flowers - Request received');
  console.log('Headers:', req.headers);
  console.log('User:', req.user);
  
  try {
    // Count total flowers
    const totalCount = await Flower.countDocuments();
    console.log('Total flowers in database:', totalCount);
    
    // Get all flowers
    const flowers = await Flower.find();
    console.log('Flowers found:', flowers.length);
    console.log('Flowers data:', JSON.stringify(flowers, null, 2));
    
    if (flowers.length === 0) {
      console.log('No flowers found, creating test data...');
      try {
        const testFlowers = [
          {
            name: 'Роза',
            description: 'Красная роза',
            price: 100,
            category: 'Розы',
            stock: 50,
            imageUrl: 'https://example.com/rose.jpg'
          },
          {
            name: 'Тюльпан',
            description: 'Желтый тюльпан',
            price: 80,
            category: 'Тюльпаны',
            stock: 30,
            imageUrl: 'https://example.com/tulip.jpg'
          }
        ];
        
        const createdFlowers = await Flower.insertMany(testFlowers);
        console.log('Test flowers created:', createdFlowers.length);
        return res.json(createdFlowers);
      } catch (createError) {
        console.error('Error creating test flowers:', createError);
        return res.status(500).json({ message: 'Ошибка при создании тестовых данных' });
      }
    }
    
    res.json(flowers);
  } catch (error) {
    console.error('Error fetching flowers:', error);
    res.status(500).json({ message: 'Ошибка при получении списка цветов' });
  }
});

// Создать новый цветок
router.post('/', authorize(['admin', 'manager']), async (req, res) => {
  try {
    console.log('POST /flowers - Request received');
    console.log('POST /flowers - User:', req.user);
    console.log('POST /flowers - Body:', req.body);
    
    const flower = new Flower(req.body);
    await flower.save();
    
    console.log('POST /flowers - Flower created:', flower);
    res.status(201).json(flower);
  } catch (error) {
    console.error('POST /flowers - Error:', error);
    res.status(500).json({ message: 'Ошибка при создании цветка' });
  }
});

// Обновление цветка
router.put('/:id', authorize(['admin', 'manager']), async (req, res) => {
  try {
    const flowerId = req.params.id;
    console.log('PUT /api/flowers/:id - Request received');
    console.log('PUT /api/flowers/:id - User:', req.user);
    console.log('PUT /api/flowers/:id - ID:', flowerId);
    console.log('PUT /api/flowers/:id - Body:', req.body);
    
    // Проверяем формат ID
    if (!mongoose.Types.ObjectId.isValid(flowerId)) {
      console.log('PUT /api/flowers/:id - Invalid flower ID format:', flowerId);
      return res.status(400).json({ message: 'Неверный формат ID цветка' });
    }
    
    // Проверяем, существует ли цветок
    const existingFlower = await Flower.findById(flowerId);
    console.log('PUT /api/flowers/:id - Existing flower:', existingFlower);
    
    if (!existingFlower) {
      console.log('PUT /api/flowers/:id - Flower not found with ID:', flowerId);
      return res.status(404).json({ message: 'Цветок не найден' });
    }
    
    // Обновляем цветок
    const updatedFlower = await Flower.findByIdAndUpdate(
      flowerId,
      req.body,
      { new: true, runValidators: true }
    );
    
    console.log('PUT /api/flowers/:id - Flower updated:', updatedFlower);
    res.json(updatedFlower);
  } catch (error) {
    console.error('PUT /api/flowers/:id - Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Неверный формат ID цветка' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Ошибка при обновлении цветка' });
  }
});

// Удаление цветка
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const flowerId = req.params.id;
    console.log('DELETE /api/flowers/:id - Request received');
    console.log('DELETE /api/flowers/:id - User:', req.user);
    console.log('DELETE /api/flowers/:id - ID:', flowerId);
    
    // Проверяем формат ID
    if (!mongoose.Types.ObjectId.isValid(flowerId)) {
      console.log('DELETE /api/flowers/:id - Invalid flower ID format:', flowerId);
      return res.status(400).json({ message: 'Неверный формат ID цветка' });
    }
    
    // Проверяем, существует ли цветок
    const existingFlower = await Flower.findById(flowerId);
    console.log('DELETE /api/flowers/:id - Existing flower:', existingFlower);
    
    if (!existingFlower) {
      console.log('DELETE /api/flowers/:id - Flower not found with ID:', flowerId);
      return res.status(404).json({ message: 'Цветок не найден' });
    }
    
    // Физическое удаление цветка
    const deletedFlower = await Flower.findByIdAndDelete(flowerId);
    console.log('DELETE /api/flowers/:id - Flower deleted:', deletedFlower);
    
    res.status(200).json({ 
      message: 'Цветок успешно удален',
      deletedFlower: {
        id: deletedFlower._id,
        name: deletedFlower.name
      }
    });
  } catch (error) {
    console.error('DELETE /api/flowers/:id - Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Неверный формат ID цветка' });
    }
    res.status(500).json({ message: 'Ошибка при удалении цветка' });
  }
});

module.exports = router;