require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { authenticateJWT } = require('./middleware/auth');

// Импорт роутов
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const flowerRoutes = require('./routes/flowers');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');

// Импорт моделей
const User = require('./models/User');
const Flower = require('./models/Flower');
const Order = require('./models/Order');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/flowers', authenticateJWT, flowerRoutes);
app.use('/api/orders', authenticateJWT, orderRoutes);
app.use('/api/reports', authenticateJWT, reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Тестовые данные
const TEST_DATA = {
  users: [
    {
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin'
    },
    {
      name: 'Manager User',
      email: 'manager@test.com',
      password: 'manager123',
      role: 'manager'
    },
    {
      name: 'Customer User',
      email: 'customer@test.com',
      password: 'customer123',
      role: 'customer'
    }
  ],
  flowers: [
    {
      name: 'Red Rose',
      description: 'Beautiful red rose',
      price: 100.99,
      category: 'roses',
      stock: 50
    },
    {
      name: 'White Tulip',
      description: 'Elegant white tulip',
      price: 50.00,
      category: 'tulips',
      stock: 100
    },
    {
      name: 'Sunflower',
      description: 'Bright yellow sunflower',
      price: 300.50,
      category: 'seasonal',
      stock: 30
    }
  ]
};

// Подключение к MongoDB и запуск сервера
async function startServer() {
  try {
    // Подключение к базе данных
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');

    // Запуск сервера
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Обработка непредвиденных ошибок
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Запуск приложения
startServer();