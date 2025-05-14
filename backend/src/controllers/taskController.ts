import { Request, Response } from 'express';
import Task from '../models/Task';
import asyncHandler from 'express-async-handler';

// @desc    Создать новую задачу
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, dueDate, assignedTo, priority, familyId } = req.body;
  
  if (!title) {
    res.status(400);
    throw new Error('Название задачи обязательно');
  }

  // @ts-ignore
  const user = req.user;

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

// @desc    Получить все задачи пользователя или семьи
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { familyId } = req.query;
  
  // @ts-ignore
  const user = req.user;

  const filter: any = {};
  
  if (familyId) {
    filter.familyId = familyId;
  } else {
    // Если не указан ID семьи, возвращаем задачи пользователя
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

// @desc    Получить задачу по ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name')
    .populate('assignedBy', 'name');

  if (!task) {
    res.status(404);
    throw new Error('Задача не найдена');
  }

  res.json(task);
});

// @desc    Обновить задачу
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, completed, dueDate, assignedTo, priority } = req.body;

  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Задача не найдена');
  }

  // @ts-ignore
  const user = req.user;

  // Проверяем, имеет ли пользователь право обновлять эту задачу
  // (или назначен на задачу, или является создателем)
  if (task.assignedBy.toString() !== user._id.toString() && 
      task.assignedTo.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('У вас нет прав на изменение этой задачи');
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

// @desc    Удалить задачу
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Задача не найдена');
  }

  // @ts-ignore
  const user = req.user;

  // Только создатель задачи может удалить её
  if (task.assignedBy.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('У вас нет прав на удаление этой задачи');
  }

  await Task.deleteOne({ _id: req.params.id });

  res.json({ message: 'Задача удалена' });
}); 