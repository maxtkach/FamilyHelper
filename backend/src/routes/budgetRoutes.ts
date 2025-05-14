import express from 'express';
import { getBudget, updateBudget } from '../controllers/budgetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getBudget)
  .put(protect, updateBudget);

export default router; 