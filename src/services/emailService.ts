export class EmailService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.EMAIL_SERVICE_API_KEY;
  }

  async sendEmail(
    to: string,
    subject: string,
    message: string
  ): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Email service not configured. Skipping email send.');
      return false;
    }

    try {
      // Example: Using a service like Resend, SendGrid, or SMTP
      // This is a placeholder - implement based on your email service
      
      // For Resend (example):
      // const response = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     from: this.fromEmail,
      //     to,
      //     subject,
      //     html: message,
      //   }),
      // });

      // For now, just log (implement actual email sending based on your provider)
      console.log('Email would be sent:', { to, subject, message });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendLowStockNotification(
    to: string,
    equipmentName: string,
    available: number,
    threshold: number
  ): Promise<boolean> {
    const subject = `Low Stock Alert: ${equipmentName}`;
    const message = `
      <h2>Low Stock Alert</h2>
      <p>The equipment <strong>${equipmentName}</strong> is running low on stock.</p>
      <ul>
        <li>Available: ${available} units</li>
        <li>Threshold: ${threshold} units</li>
      </ul>
      <p>Please consider reordering soon.</p>
    `;

    return this.sendEmail(to, subject, message);
  }

  async sendPredictionNotification(
    to: string,
    equipmentName: string,
    daysUntilShortage: number
  ): Promise<boolean> {
    const subject = `AI Prediction: ${equipmentName} - Stock Shortage Expected`;
    const message = `
      <h2>AI Consumption Prediction</h2>
      <p>Based on historical consumption patterns, <strong>${equipmentName}</strong> is predicted to run out of stock within <strong>${daysUntilShortage} days</strong>.</p>
      <p>Please plan your reorder accordingly.</p>
    `;

    return this.sendEmail(to, subject, message);
  }
}

