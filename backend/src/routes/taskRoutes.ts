import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// @route   POST /api/tasks
// @route   GET /api/tasks
router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

// @route   GET /api/tasks/:id
// @route   PUT /api/tasks/:id
// @route   DELETE /api/tasks/:id
router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

export default router; 