import fs from 'fs';
import path from 'path';
import {
  IEmailProvider,
  ISmsProvider,
  EmailPayload,
  SmsPayload,
  NotificationResult,
} from '../types';
import { logger } from '@/backend/utils/logger';

const AUDIT_FILE = path.join(process.cwd(), 'src', 'data', 'notificationAudit.json');

function loadAuditLog(): NotificationResult[] {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const raw = fs.readFileSync(AUDIT_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Non-fatal fallback
  }
  return [];
}

// In-memory + persisted audit log for dev inspection & unit testing
export const notificationDevAuditLog: NotificationResult[] = loadAuditLog();

export function recordNotificationAudit(result: NotificationResult) {
  // Avoid duplicate push if messageId matches the most recent entry
  if (
    result.messageId &&
    notificationDevAuditLog.length > 0 &&
    notificationDevAuditLog[0].messageId === result.messageId
  ) {
    return;
  }

  notificationDevAuditLog.unshift(result);
  if (notificationDevAuditLog.length > 50) notificationDevAuditLog.pop();

  // In test runner mode, keep in memory only to avoid file pollution
  if (process.env.VITEST) return;

  try {
    const dir = path.dirname(AUDIT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(notificationDevAuditLog, null, 2), 'utf-8');
  } catch {
    // Non-fatal persistence failure
  }
}

export class ConsoleEmailProvider implements IEmailProvider {
  public readonly name = 'console-email';

  public async sendEmail(payload: EmailPayload): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();
    const messageId = `dev-email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Log stylized notification summary
    logger.info(
      `[EMAIL DISPATCH] To: ${payload.to} | Subject: "${payload.subject}" | Provider: console`
    );

    // In dev mode, log excerpt of text
    if (process.env.NODE_ENV !== 'production') {
      const preview = (payload.text || payload.html.replace(/<[^>]+>/g, ' ')).slice(0, 140).trim();
      logger.info(`[EMAIL PREVIEW] "${preview}..."`);
    }

    const result: NotificationResult = {
      success: true,
      messageId,
      provider: this.name,
      channel: 'email',
      recipient: payload.to,
      timestamp,
    };

    recordNotificationAudit(result);
    return result;
  }
}

export class ConsoleSmsProvider implements ISmsProvider {
  public readonly name = 'console-sms';

  public async sendSms(payload: SmsPayload): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();
    const messageId = `dev-sms-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    logger.info(
      `[SMS DISPATCH] To: ${payload.to} | Message: "${payload.message}" | Provider: console`
    );

    const result: NotificationResult = {
      success: true,
      messageId,
      provider: this.name,
      channel: 'sms',
      recipient: payload.to,
      timestamp,
    };

    recordNotificationAudit(result);
    return result;
  }
}
