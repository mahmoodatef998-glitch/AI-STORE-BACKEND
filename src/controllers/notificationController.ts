import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';
import { ApiResponse, Notification } from '../types';

const notificationService = new NotificationService();

export const getNotifications = async (
  req: AuthRequest,
  res: Response<ApiResponse<Notification[]>>
): Promise<void> => {
  try {
    const userId = req.query.user_id as string | undefined;
    const sent = req.query.sent === 'true' ? true : req.query.sent === 'false' ? false : undefined;

    const notifications = await notificationService.getNotifications(userId, sent);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notifications',
    });
  }
};

export const markNotificationAsSent = async (
  req: AuthRequest,
  res: Response<ApiResponse<Notification>>
): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsSent(id);
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as sent:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notification',
    });
  }
};

