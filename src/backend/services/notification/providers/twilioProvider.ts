import { ISmsProvider, SmsPayload, NotificationResult } from '../types';
import { logger } from '@/backend/utils/logger';

export class TwilioSmsProvider implements ISmsProvider {
  public readonly name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid.trim().replace(/^["']|["']$/g, '');
    this.authToken = authToken.trim().replace(/^["']|["']$/g, '');
    this.fromNumber = fromNumber
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/\s+/g, '');
  }

  public async sendSms(payload: SmsPayload): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const normalizedTo = payload.to.replace(/[\s\-()]/g, '');
      const formData = new URLSearchParams();
      formData.append('To', normalizedTo);
      formData.append('From', payload.senderId || this.fromNumber);
      formData.append('Body', payload.message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = (await response.json()) as {
        sid?: string;
        message?: string;
        code?: number;
        more_info?: string;
        detail?: string;
      };

      if (!response.ok) {
        const errorDetail =
          data.message || data.detail || `Twilio API returned status ${response.status}`;
        const codeInfo = data.code
          ? ` [Twilio Code ${data.code}${data.more_info ? ` - ${data.more_info}` : ''}]`
          : '';
        throw new Error(`${errorDetail}${codeInfo}`);
      }

      logger.info(`[TWILIO SMS SENT] To: ${payload.to} | Twilio SID: ${data.sid}`);

      return {
        success: true,
        messageId: data.sid,
        provider: this.name,
        channel: 'sms',
        recipient: payload.to,
        timestamp,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown Twilio SMS error';
      logger.error(`[TWILIO SMS ERROR] Failed to send to ${payload.to}: ${errorMsg}`);

      return {
        success: false,
        error: errorMsg,
        provider: this.name,
        channel: 'sms',
        recipient: payload.to,
        timestamp,
      };
    }
  }
}
