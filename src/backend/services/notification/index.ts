import {
  IEmailProvider,
  ISmsProvider,
  EmailPayload,
  SmsPayload,
  NotificationResult,
} from './types';
import {
  ConsoleEmailProvider,
  ConsoleSmsProvider,
  recordNotificationAudit,
} from './providers/consoleProviders';
import { ResendEmailProvider } from './providers/resendProvider';
import { TwilioSmsProvider } from './providers/twilioProvider';
import {
  renderOrderConfirmationEmail,
  renderOrderStatusEmail,
  renderContactInquiryEmail,
  renderNewsletterWelcomeEmail,
} from './templates/emailTemplates';
import {
  renderOrderConfirmationSms,
  renderOrderStatusSms,
  renderContactInquirySms,
} from './templates/smsTemplates';
import { OrderRecord } from '@/backend/models/orderModel';
import { ContactSubmission } from '@/backend/models/contactModel';
import { logger } from '@/backend/utils/logger';

class CentralNotificationService {
  private emailProvider: IEmailProvider;
  private smsProvider: ISmsProvider;

  constructor() {
    // 1. Resolve Email Provider
    if (process.env.RESEND_API_KEY) {
      this.emailProvider = new ResendEmailProvider(
        process.env.RESEND_API_KEY,
        process.env.EMAIL_FROM || 'The Bombay Edit <orders@thebombayedit.com>'
      );
      logger.info('NotificationService: initialized Resend email provider');
    } else {
      this.emailProvider = new ConsoleEmailProvider();
      logger.info('NotificationService: using development console email provider');
    }

    // 2. Resolve SMS Provider
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      this.smsProvider = new TwilioSmsProvider(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
        process.env.TWILIO_PHONE_NUMBER
      );
      logger.info('NotificationService: initialized Twilio SMS provider');
    } else {
      this.smsProvider = new ConsoleSmsProvider();
      logger.info('NotificationService: using development console SMS provider');
    }
  }

  /**
   * Set custom providers (useful for testing or switching at runtime)
   */
  public setEmailProvider(provider: IEmailProvider) {
    this.emailProvider = provider;
  }

  public setSmsProvider(provider: ISmsProvider) {
    this.smsProvider = provider;
  }

  public getEmailProviderName(): string {
    return this.emailProvider.name;
  }

  public getSmsProviderName(): string {
    return this.smsProvider.name;
  }

  /**
   * Send raw email
   */
  public async sendEmail(payload: EmailPayload): Promise<NotificationResult> {
    let result: NotificationResult;
    try {
      result = await this.emailProvider.sendEmail(payload);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown email dispatch error';
      logger.error(`[NOTIFICATION ERROR] Email failed to ${payload.to}: ${errorMsg}`);
      result = {
        success: false,
        error: errorMsg,
        provider: this.emailProvider.name,
        channel: 'email',
        recipient: payload.to,
        timestamp: new Date().toISOString(),
      };
    }
    recordNotificationAudit(result);
    return result;
  }

  /**
   * Send raw SMS
   */
  public async sendSms(payload: SmsPayload): Promise<NotificationResult> {
    let result: NotificationResult;
    try {
      result = await this.smsProvider.sendSms(payload);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown SMS dispatch error';
      logger.error(`[NOTIFICATION ERROR] SMS failed to ${payload.to}: ${errorMsg}`);
      result = {
        success: false,
        error: errorMsg,
        provider: this.smsProvider.name,
        channel: 'sms',
        recipient: payload.to,
        timestamp: new Date().toISOString(),
      };
    }
    recordNotificationAudit(result);
    return result;
  }

  /**
   * High-Level: Order Confirmation (Email + SMS)
   * Dispatches non-blocking notifications to the customer
   */
  public async sendOrderConfirmation(
    order: OrderRecord
  ): Promise<{ email: NotificationResult; sms?: NotificationResult }> {
    try {
      const emailContent = renderOrderConfirmationEmail(order);
      const emailPromise = this.sendEmail({
        to: order.customer.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      let smsPromise: Promise<NotificationResult> | undefined;
      const phone = order.customer.phone?.trim();
      if (phone && phone !== 'N/A' && phone.length >= 7) {
        const smsContent = renderOrderConfirmationSms(order);
        smsPromise = this.sendSms({
          to: phone,
          message: smsContent,
        });
      }

      const [emailResult, smsResult] = await Promise.all([
        emailPromise,
        smsPromise ? smsPromise : Promise.resolve(undefined),
      ]);

      return { email: emailResult, sms: smsResult };
    } catch (err) {
      logger.error(
        `[NOTIFICATION] Order confirmation dispatch failed for #${order.orderNumber}:`,
        err
      );
      return {
        email: {
          success: false,
          error: String(err),
          provider: this.emailProvider.name,
          channel: 'email',
          recipient: order.customer.email,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * High-Level: Order Status Update (Email + SMS)
   */
  public async sendOrderStatusUpdate(
    order: OrderRecord,
    newStatus: string
  ): Promise<{ email: NotificationResult; sms?: NotificationResult }> {
    try {
      const emailContent = renderOrderStatusEmail(order, newStatus);
      const emailPromise = this.sendEmail({
        to: order.customer.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      let smsPromise: Promise<NotificationResult> | undefined;
      const phone = order.customer.phone?.trim();
      if (phone && phone !== 'N/A' && phone.length >= 7) {
        const smsContent = renderOrderStatusSms(order, newStatus);
        smsPromise = this.sendSms({
          to: phone,
          message: smsContent,
        });
      }

      const [emailResult, smsResult] = await Promise.all([
        emailPromise,
        smsPromise ? smsPromise : Promise.resolve(undefined),
      ]);

      return { email: emailResult, sms: smsResult };
    } catch (err) {
      logger.error(`[NOTIFICATION] Status update dispatch failed for #${order.orderNumber}:`, err);
      return {
        email: {
          success: false,
          error: String(err),
          provider: this.emailProvider.name,
          channel: 'email',
          recipient: order.customer.email,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * High-Level: Contact Concierge Acknowledgment
   */
  public async sendContactAcknowledgment(
    submission: ContactSubmission
  ): Promise<{ email: NotificationResult; sms?: NotificationResult }> {
    try {
      const emailContent = renderContactInquiryEmail(submission);
      const emailPromise = this.sendEmail({
        to: submission.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      let smsPromise: Promise<NotificationResult> | undefined;
      const phone = submission.phone?.trim();
      if (phone && phone !== 'N/A' && phone.length >= 7) {
        const smsContent = renderContactInquirySms(submission);
        smsPromise = this.sendSms({
          to: phone,
          message: smsContent,
        });
      }

      const [emailResult, smsResult] = await Promise.all([
        emailPromise,
        smsPromise ? smsPromise : Promise.resolve(undefined),
      ]);

      return { email: emailResult, sms: smsResult };
    } catch (err) {
      logger.error(`[NOTIFICATION] Contact acknowledgment failed for ${submission.email}:`, err);
      return {
        email: {
          success: false,
          error: String(err),
          provider: this.emailProvider.name,
          channel: 'email',
          recipient: submission.email,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * High-Level: Newsletter Welcome Email
   */
  public async sendNewsletterWelcome(email: string): Promise<NotificationResult> {
    try {
      const emailContent = renderNewsletterWelcomeEmail(email);
      return await this.sendEmail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (err) {
      logger.error(`[NOTIFICATION] Newsletter welcome failed for ${email}:`, err);
      return {
        success: false,
        error: String(err),
        provider: this.emailProvider.name,
        channel: 'email',
        recipient: email,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance for app-wide use
export const NotificationService = new CentralNotificationService();
export * from './types';
export {
  notificationDevAuditLog,
  ConsoleEmailProvider,
  ConsoleSmsProvider,
} from './providers/consoleProviders';
export { ResendEmailProvider } from './providers/resendProvider';
export { TwilioSmsProvider } from './providers/twilioProvider';
export * from './templates/emailTemplates';
export * from './templates/smsTemplates';
