const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateJWT = async (req, res, next) => {
  console.log('Auth middleware - Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Auth middleware - Token:', token);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded token:', decoded);
    
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      console.log('Auth middleware - User not found');
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    
    console.log('Auth middleware - User authenticated:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware - JWT error:', err);
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

module.exports = { authenticateJWT };