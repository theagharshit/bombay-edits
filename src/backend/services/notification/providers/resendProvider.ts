import { IEmailProvider, EmailPayload, NotificationResult } from '../types';
import { logger } from '@/backend/utils/logger';

export class ResendEmailProvider implements IEmailProvider {
  public readonly name = 'resend';
  private apiKey: string;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom = 'The Bombay Edit <orders@thebombayedit.com>') {
    this.apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
    this.defaultFrom = defaultFrom.trim().replace(/^["']|["']$/g, '');
  }

  public async sendEmail(payload: EmailPayload): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from || this.defaultFrom,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo,
        }),
      });

      const data = (await response.json()) as { id?: string; message?: string };

      if (!response.ok) {
        throw new Error(data.message || `Resend API returned status ${response.status}`);
      }

      logger.info(`[RESEND EMAIL SENT] To: ${payload.to} | Resend ID: ${data.id}`);

      return {
        success: true,
        messageId: data.id,
        provider: this.name,
        channel: 'email',
        recipient: payload.to,
        timestamp,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Resend delivery error';
      logger.error(`[RESEND EMAIL ERROR] Failed to send to ${payload.to}: ${errorMsg}`);

      return {
        success: false,
        error: errorMsg,
        provider: this.name,
        channel: 'email',
        recipient: payload.to,
        timestamp,
      };
    }
  }
}
