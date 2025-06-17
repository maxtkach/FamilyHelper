import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import eventRoutes from './routes/eventRoutes';
import budgetRoutes from './routes/budgetRoutes';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Налаштування CORS для мобільного додатку
app.use(cors({
  origin: '*', // Дозволити запити з будь-яких джерел
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  exposedHeaders: ['Authorization']
}));

// Middleware для логування запитів
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.json());

// Базовий маршрут для перевірки роботи API
app.get('/', (req, res) => {
  res.json({ message: 'API працює' });
});

// Використання маршрутів
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/budget', budgetRoutes);

// Інші маршрути будуть додані пізніше
// app.use('/api/families', familyRoutes);
// app.use('/api/transactions', transactionRoutes);

// Обробка помилок
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Помилка:', err);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: err.message || 'Внутрішня помилка сервера',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Обробка 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Маршрут не знайдено' });
});

app.use(errorHandler);

// Підключення до MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Підключено до MongoDB');
    app.listen(PORT, () => {
      console.log(`Сервер запущено на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Помилка підключення до MongoDB:', err.message);
  });

export default app; 