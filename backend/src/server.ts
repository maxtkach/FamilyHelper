import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import taskRoutes from './routes/taskRoutes';
import eventRoutes from './routes/eventRoutes';
import budgetRoutes from './routes/budgetRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка CORS для мобильного приложения
app.use(cors({
  origin: '*', // Разрешить запросы с любых источников
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Базовый маршрут для проверки работы API
app.get('/', (req, res) => {
  res.json({ message: 'API работает' });
});

// Использование маршрутов
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/budget', budgetRoutes);

// Другие маршруты будут добавлены позже
// app.use('/api/families', familyRoutes);
// app.use('/api/transactions', transactionRoutes);

// Обработка ошибок
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Ошибка:', err);
  
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Обработка 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

app.use(errorHandler);

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Подключено к MongoDB');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Ошибка подключения к MongoDB:', err.message);
  });

export default app; 