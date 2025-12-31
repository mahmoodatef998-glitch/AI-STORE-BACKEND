import { supabase } from '../config/supabase';
import { Notification, NotificationType } from '../types';
import { EmailService } from './emailService';

export class NotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async createNotification(
    type: NotificationType,
    message: string,
    equipmentId?: string,
    userId?: string
  ): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        type,
        message,
        equipment_id: equipmentId || null,
        user_id: userId || null,
        sent: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getNotifications(userId?: string, sent?: boolean): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false });

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    if (sent !== undefined) {
      query = query.eq('sent', sent);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async markAsSent(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ sent: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUnsentNotifications(): Promise<Notification[]> {
    return this.getNotifications(undefined, false);
  }

  async processEmailNotifications(): Promise<void> {
    const unsentNotifications = await this.getUnsentNotifications();
    const emailNotifications = unsentNotifications.filter(
      (n) => n.type === 'email'
    );

    for (const notification of emailNotifications) {
      // Get user email if user_id is set
      if (notification.user_id) {
        const { data: user } = await supabase.auth.admin.getUserById(
          notification.user_id
        );

        if (user?.user?.email) {
          const sent = await this.emailService.sendEmail(
            user.user.email,
            'Equipment Inventory Notification',
            notification.message
          );

          if (sent) {
            await this.markAsSent(notification.id);
          }
        }
      }
    }
  }
}
