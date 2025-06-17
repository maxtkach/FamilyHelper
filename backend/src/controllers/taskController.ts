import { Request, Response } from 'express';
import Task from '../models/Task';
import asyncHandler from 'express-async-handler';

// @desc    Створити нове завдання
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, dueDate, assignedTo, priority, familyId } = req.body;
  
  if (!title) {
    res.status(400);
    throw new Error('Назва завдання обов\'язкова');
  }

  // @ts-ignore
  const user = req.user;
  
  if (!user) {
    res.status(401);
    throw new Error('Користувач не авторизований');
  }

  const task = await Task.create({
    title,
    description,
    dueDate: dueDate || undefined,
    assignedTo: assignedTo || user._id,
    assignedBy: user._id,
    familyId,
    priority: priority || 'medium',
    completed: false,
  });

  res.status(201).json(task);
});

// @desc    Отримати всі завдання користувача або родини
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { familyId } = req.query;
  
  // @ts-ignore
  const user = req.user;
  
  if (!user) {
    res.status(401);
    throw new Error('Користувач не авторизований');
  }

  const filter: any = {};
  
  if (familyId) {
    filter.familyId = familyId;
  } else {
    // Якщо не вказано ID родини, повертаємо завдання користувача
    filter.$or = [
      { assignedTo: user._id },
      { assignedBy: user._id }
    ];
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name')
    .populate('assignedBy', 'name')
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// @desc    Отримати завдання за ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name')
    .populate('assignedBy', 'name');

  if (!task) {
    res.status(404);
    throw new Error('Завдання не знайдено');
  }

  res.json(task);
});

// @desc    Оновити завдання
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, completed, dueDate, assignedTo, priority } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Завдання не знайдено');
  }

  // @ts-ignore
  const user = req.user;
  
  if (!user) {
    res.status(401);
    throw new Error('Користувач не авторизований');
  }

  // Перевіряємо, чи має користувач право оновлювати це завдання
  // (або призначений на завдання, або є створювачем)
  if (task.assignedBy.toString() !== user._id.toString() && 
      task.assignedTo.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('У вас немає прав на зміну цього завдання');
  }

  task.title = title || task.title;
  task.description = description !== undefined ? description : task.description;
  task.completed = completed !== undefined ? completed : task.completed;
  task.dueDate = dueDate || task.dueDate;
  task.assignedTo = assignedTo || task.assignedTo;
  task.priority = priority || task.priority;

  const updatedTask = await task.save();

  res.json(updatedTask);
});

// @desc    Видалити завдання
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Завдання не знайдено');
  }

  // @ts-ignore
  const user = req.user;
  
  if (!user) {
    res.status(401);
    throw new Error('Користувач не авторизований');
  }

  // Тільки створювач завдання може видалити його
  if (task.assignedBy.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('У вас немає прав на видалення цього завдання');
  }

  await Task.deleteOne({ _id: req.params.id });

  res.json({ message: 'Завдання видалено' });
}); 