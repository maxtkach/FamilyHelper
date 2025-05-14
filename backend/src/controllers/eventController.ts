import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Event from '../models/Event';
import mongoose from 'mongoose';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, startDate, endDate, participants, location } = req.body;

  console.log('Получен запрос на создание события:', req.body);

  if (!title) {
    res.status(400);
    throw new Error('Пожалуйста, укажите название события');
  }

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Пожалуйста, укажите даты начала и конца события');
  }

  // Проверяем валидность дат
  try {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    console.log('Преобразованные даты:', {
      startDate: startDateObj.toISOString(),
      endDate: endDateObj.toISOString()
    });
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      res.status(400);
      throw new Error('Некорректный формат даты');
    }
  } catch (error) {
    console.error('Ошибка при обработке дат:', error);
    res.status(400);
    throw new Error('Ошибка обработки дат');
  }

  // @ts-ignore - добавляем поле user из middleware
  const userId = req.user._id;
  console.log('ID пользователя:', userId);

  const event = await Event.create({
    title,
    description,
    startDate,
    endDate,
    participants: participants || [],
    location,
    user: userId,
  });

  if (event) {
    console.log('Создано событие:', event);
    res.status(201).json(event);
  } else {
    res.status(400);
    throw new Error('Некорректные данные события');
  }
});

// @desc    Get all events for a user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore - добавляем поле user из middleware
  const userId = req.user._id;
  console.log('Запрос на получение событий для пользователя:', userId);

  const events = await Event.find({ user: userId }).sort({ startDate: 1 });
  console.log(`Найдено ${events.length} событий`);

  res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore - добавляем поле user из middleware
  const userId = req.user._id;

  const event = await Event.findOne({
    _id: req.params.id,
    user: userId,
  });

  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Событие не найдено');
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore - добавляем поле user из middleware
  const userId = req.user._id;

  const event = await Event.findOne({
    _id: req.params.id,
    user: userId,
  });

  if (!event) {
    res.status(404);
    throw new Error('Событие не найдено');
  }

  // Обновляем данные события
  event.title = req.body.title || event.title;
  event.description = req.body.description || event.description;
  event.startDate = req.body.startDate || event.startDate;
  event.endDate = req.body.endDate || event.endDate;
  event.participants = req.body.participants || event.participants;
  event.location = req.body.location || event.location;

  const updatedEvent = await event.save();

  res.json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore - добавляем поле user из middleware
  const userId = req.user._id;

  const event = await Event.findOne({
    _id: req.params.id,
    user: userId,
  });

  if (!event) {
    res.status(404);
    throw new Error('Событие не найдено');
  }

  await event.deleteOne();

  res.json({ message: 'Событие удалено' });
});

export {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
}; 