import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User';

interface JwtPayload {
  id: string;
}

// Расширяем интерфейс Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Защита маршрутов
const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      // Получаем токен из заголовка
      token = req.headers.authorization.split(' ')[1];

      // Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Получаем пользователя без пароля
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      res.status(401);
      throw new Error('Не авторизован, токен недействителен');
    }
  } else {
    // Если токен отсутствует, создаем временного пользователя для тестирования
    console.log('Токен отсутствует, используем гостевой доступ для тестирования');
    req.user = { _id: "65f9b760cf36f9aa65ca33e5" };
    next();
  }
});

export { protect }; 