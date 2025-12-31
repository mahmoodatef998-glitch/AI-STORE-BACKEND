import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsSent,
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get notifications
router.get('/', getNotifications);

// Mark notification as sent
router.put('/:id/sent', markNotificationAsSent);

export default router;

