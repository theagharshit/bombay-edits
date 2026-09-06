export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

export interface SmsPayload {
  to: string;
  message: string;
  senderId?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  channel: 'email' | 'sms';
  recipient: string;
  timestamp: string;
}

export interface IEmailProvider {
  name: string;
  sendEmail(payload: EmailPayload): Promise<NotificationResult>;
}

export interface ISmsProvider {
  name: string;
  sendSms(payload: SmsPayload): Promise<NotificationResult>;
}
