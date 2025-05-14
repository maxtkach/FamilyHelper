import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import Family from '../models/Family';
import { AuthRequest } from '../middlewares/authMiddleware';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

// Создание JWT токена
const generateToken = (id: string | mongoose.Types.ObjectId) => {
  const idStr = typeof id === 'string' ? id : id.toString();
  return jwt.sign({ id: idStr }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '30d',
  });
};

// @desc    Регистрация нового пользователя
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Пожалуйста, заполните все поля');
    }

    // Проверка существования пользователя
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('Пользователь с таким email уже существует');
    }

    // Валидация роли
    const validRoles = ['parent', 'child', 'personal', 'boyfriend', 'girlfriend'];
    if (role && !validRoles.includes(role)) {
      res.status(400);
      throw new Error('Недопустимая роль');
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создание пользователя
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'personal',
    }) as IUser & { _id: mongoose.Types.ObjectId };

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points || 0,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Невалидные данные пользователя');
    }
  } catch (error) {
    console.error('Error in registerUser: ', error);
    throw error;
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Проверка email и пароля
  const user = await User.findOne({ email }) as IUser & { _id: mongoose.Types.ObjectId };

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points || 0,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Неверный email или пароль');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?._id) {
    res.status(401);
    throw new Error('Не авторизован');
  }
  
  const user = await User.findById(req.user._id) as IUser & { _id: mongoose.Types.ObjectId };

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points || 0,
    });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log('Запрос на обновление профиля:', {
    body: req.body,
    user: req.user?._id
  });

  if (!req.user?._id) {
    res.status(401);
    throw new Error('Не авторизован');
  }
  
  const user = await User.findById(req.user._id) as IUser & { _id: mongoose.Types.ObjectId };
  console.log('Найден пользователь:', user ? { id: user._id, role: user.role } : 'не найден');

  if (user) {
    // Сохраняем старые значения для сравнения
    const oldValues = {
      name: user.name,
      email: user.email,
      role: user.role
    };

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    
    // Обрабатываем обновление роли
    if (req.body.role) {
      console.log(`Попытка сменить роль с '${user.role}' на '${req.body.role}'`);
      const validRoles = ['parent', 'child', 'personal', 'boyfriend', 'girlfriend'];
      if (!validRoles.includes(req.body.role)) {
        res.status(400);
        throw new Error('Недопустимая роль');
      }
      user.role = req.body.role;
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save() as IUser & { _id: mongoose.Types.ObjectId };

    // Проверяем, что изменения действительно произошли
    const changes = {
      name: oldValues.name !== updatedUser.name ? `${oldValues.name} -> ${updatedUser.name}` : 'без изменений',
      email: oldValues.email !== updatedUser.email ? `${oldValues.email} -> ${updatedUser.email}` : 'без изменений',
      role: oldValues.role !== updatedUser.role ? `${oldValues.role} -> ${updatedUser.role}` : 'без изменений'
    };

    console.log('Профиль пользователя обновлен:', {
      id: updatedUser._id,
      changes
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      points: updatedUser.points || 0,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('Пользователь не найден');
  }
});

export default {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
}; 