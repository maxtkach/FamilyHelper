import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface DecodedToken {
  id: string;
}

interface AuthRequest extends Request {
  user?: IUser;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  
  console.log('Перевірка авторизації...');
  console.log('Headers:', req.headers);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Отримуємо токен з заголовка
      token = req.headers.authorization.split(' ')[1];
      console.log('Токен отримано:', token.substring(0, 10) + '...');

      // Перевіряємо токен
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default_secret'
      ) as DecodedToken;
      
      console.log('Токен верифіковано, ID користувача:', decoded.id);

      // Отримуємо користувача за токеном
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.error('Користувача не знайдено в базі даних');
        res.status(401);
        throw new Error('Не авторизовано, користувача не знайдено');
      }
      
      console.log('Користувача знайдено:', req.user._id);

      next();
    } catch (error) {
      console.error('Помилка авторизації:', error);
      res.status(401);
      throw new Error('Не авторизовано, токен недійсний');
    }
  } else {
    console.error('Токен відсутній в заголовку запиту');
  }

  if (!token) {
    res.status(401);
    throw new Error('Не авторизовано, токен відсутній');
  }
};

const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Немає доступу, потрібні права адміністратора');
  }
};

export { protect, admin, AuthRequest }; 