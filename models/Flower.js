const mongoose = require('mongoose');

const flowerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Название цветка обязательно'],
    trim: true,
    minlength: [2, 'Название должно содержать минимум 2 символа']
  },
  description: {
    type: String,
    required: [true, 'Описание цветка обязательно'],
    trim: true,
    minlength: [10, 'Описание должно содержать минимум 10 символов']
  },
  price: {
    type: Number,
    required: [true, 'Цена обязательна'],
    min: [0, 'Цена не может быть отрицательной']
  },
  category: {
    type: String,
    required: [true, 'Категория обязательна'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Количество на складе обязательно'],
    min: [0, 'Количество не может быть отрицательным'],
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Индексы для оптимизации поиска
flowerSchema.index({ name: 'text', description: 'text' });
flowerSchema.index({ category: 1 });

// Middleware для логирования
flowerSchema.pre('save', function(next) {
  console.log('Saving flower:', {
    name: this.name,
    price: this.price,
    category: this.category
  });
  next();
});

flowerSchema.pre('find', function() {
  console.log('Finding flowers with query:', this.getQuery());
});

const Flower = mongoose.model('Flower', flowerSchema);

// Функция для инициализации тестовых данных
async function initializeTestData() {
  try {
    const count = await Flower.countDocuments();
    console.log('Current flower count:', count);
    
    if (count === 0) {
      console.log('Creating test flowers...');
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
    }
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
}

// Вызываем функцию инициализации при запуске
initializeTestData();

module.exports = Flower;