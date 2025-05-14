import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// @route   POST /api/events
router.post('/', protect, createEvent);

// @route   GET /api/events
router.get('/', protect, getEvents);

// @route   GET /api/events/:id
router.get('/:id', protect, getEventById);

// @route   PUT /api/events/:id
router.put('/:id', protect, updateEvent);

// @route   DELETE /api/events/:id
router.delete('/:id', protect, deleteEvent);

export default router; 