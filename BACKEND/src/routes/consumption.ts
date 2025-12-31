import { Router } from 'express';
import {
  logConsumption,
  getConsumptionHistory,
  getConsumptionById,
} from '../controllers/consumptionController';
import { authenticateToken } from '../middleware/auth';
import { validateConsumption, validate } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Log consumption
router.post('/', validate(validateConsumption), logConsumption);

// Get consumption history
router.get('/', getConsumptionHistory);

// Get consumption by ID
router.get('/:id', getConsumptionById);

export default router;

