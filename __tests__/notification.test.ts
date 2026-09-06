import { describe, it, expect } from 'vitest';
import {
  NotificationService,
  ConsoleEmailProvider,
  ConsoleSmsProvider,
  notificationDevAuditLog,
  renderOrderConfirmationEmail,
  renderOrderStatusEmail,
  renderContactInquiryEmail,
  renderNewsletterWelcomeEmail,
  renderOrderConfirmationSms,
  renderOrderStatusSms,
  renderContactInquirySms,
} from '@/backend/services/notification';
import { OrderRecord } from '@/backend/models/orderModel';
import { ContactSubmission } from '@/backend/models/contactModel';

const mockOrder: OrderRecord = {
  id: 'test-ord-123',
  orderId: 'test-ord-123',
  orderNumber: 'TBE-TEST-123',
  customerId: 'cust-123',
  customer: {
    firstName: 'Devika',
    lastName: 'Rani',
    email: 'devika.rani@example.com',
    phone: '+91 98765 43210',
    address: '10 Heritage Lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
  },
  items: [
    {
      productId: 'prod-001',
      slug: 'benarasi-gold-zari',
      name: 'Benarasi Gold Zari Brocade Saree',
      price: 25000,
      quantity: 1,
      size: 'Free Size',
      colour: 'Crimson Gold',
    },
  ],
  shippingZone: 'Express Concierge Courier',
  shippingCost: 0,
  subtotal: 25000,
  currency: 'INR',
  total: 25000,
  paymentMethod: 'Prepaid Escrow',
  status: 'confirmed',
  trackingNumber: 'TRACK-8899',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockContact: ContactSubmission = {
  id: 'sub-test-456',
  name: 'Kabir Khan',
  email: 'kabir.khan@example.com',
  phone: '+91 98200 98200',
  subject: 'Bespoke Inquiry',
  message: 'Seeking a private consultation for bespoke textiles.',
  orderNumber: 'TBE-TEST-123',
  status: 'new',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Notification Service: Templates', () => {
  it('renders order confirmation HTML with luxury design elements and order details', () => {
    const email = renderOrderConfirmationEmail(mockOrder);
    expect(email.subject).toContain('TBE-TEST-123');
    expect(email.html).toContain('The Bombay Edit');
    expect(email.html).toContain('Devika Rani');
    expect(email.html).toContain('Benarasi Gold Zari Brocade Saree');
    expect(email.html).toContain('25,000');
    expect(email.text).toContain('TBE-TEST-123');
  });

  it('renders order status update HTML with tracking reference', () => {
    const email = renderOrderStatusEmail(mockOrder, 'dispatched');
    expect(email.subject).toContain('Dispatched');
    expect(email.subject).toContain('TBE-TEST-123');
    expect(email.html).toContain('TRACK-8899');
    expect(email.html).toContain('Dispatched');
  });

  it('renders contact inquiry acknowledgment HTML', () => {
    const email = renderContactInquiryEmail(mockContact);
    expect(email.subject).toContain('Inquiry Acknowledged');
    expect(email.html).toContain('Kabir Khan');
    expect(email.html).toContain('Bespoke Inquiry');
    expect(email.html).toContain('sub-test-456');
  });

  it('renders newsletter welcome HTML', () => {
    const email = renderNewsletterWelcomeEmail('subscriber@heritage.com');
    expect(email.subject).toContain('The Bombay Edit');
    expect(email.html).toContain('subscriber@heritage.com');
    expect(email.html).toContain('Private Salon Previews');
  });

  it('renders carrier-compliant SMS templates within concise length limits', () => {
    const orderSms = renderOrderConfirmationSms(mockOrder);
    expect(orderSms).toContain('TBE-TEST-123');
    expect(orderSms.length).toBeLessThanOrEqual(160);

    const statusSms = renderOrderStatusSms(mockOrder, 'dispatched');
    expect(statusSms).toContain('TBE-TEST-123');
    expect(statusSms).toContain('Dispatched');
    expect(statusSms.length).toBeLessThanOrEqual(160);

    const contactSms = renderContactInquirySms(mockContact);
    expect(contactSms).toContain('sub-test-456');
    expect(contactSms.length).toBeLessThanOrEqual(160);
  });
});

describe('Notification Service: Console Providers & Audit Logging', () => {
  it('dispatches email via ConsoleEmailProvider and logs to audit memory', async () => {
    const provider = new ConsoleEmailProvider();
    const result = await provider.sendEmail({
      to: 'guest@example.com',
      subject: 'Test Subject',
      html: '<p>Test Message</p>',
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('console-email');
    expect(result.channel).toBe('email');
    expect(result.recipient).toBe('guest@example.com');
    expect(notificationDevAuditLog.length).toBeGreaterThan(0);
    expect(notificationDevAuditLog[0].recipient).toBe('guest@example.com');
  });

  it('dispatches SMS via ConsoleSmsProvider and logs to audit memory', async () => {
    const provider = new ConsoleSmsProvider();
    const result = await provider.sendSms({
      to: '+919999988888',
      message: 'The Bombay Edit: Test SMS payload',
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('console-sms');
    expect(result.channel).toBe('sms');
    expect(result.recipient).toBe('+919999988888');
    expect(notificationDevAuditLog[0].recipient).toBe('+919999988888');
  });
});

describe('Notification Service: Central Facade High-Level API', () => {
  it('sends order confirmation to both email and phone', async () => {
    const res = await NotificationService.sendOrderConfirmation(mockOrder);
    expect(res.email.success).toBe(true);
    expect(res.email.recipient).toBe('devika.rani@example.com');
    expect(res.sms).toBeDefined();
    expect(res.sms?.success).toBe(true);
    expect(res.sms?.recipient).toBe('+91 98765 43210');
  });

  it('sends contact inquiry acknowledgment to email and phone', async () => {
    const res = await NotificationService.sendContactAcknowledgment(mockContact);
    expect(res.email.success).toBe(true);
    expect(res.email.recipient).toBe('kabir.khan@example.com');
    expect(res.sms).toBeDefined();
    expect(res.sms?.success).toBe(true);
  });

  it('sends newsletter welcome email', async () => {
    const res = await NotificationService.sendNewsletterWelcome('collector@ateliertest.com');
    expect(res.success).toBe(true);
    expect(res.recipient).toBe('collector@ateliertest.com');
  });

  it('allows swapping custom providers at runtime', async () => {
    let customCalled = false;
    NotificationService.setEmailProvider({
      name: 'custom-mock-provider',
      sendEmail: async (payload) => {
        customCalled = true;
        return {
          success: true,
          provider: 'custom-mock-provider',
          channel: 'email',
          recipient: payload.to,
          timestamp: new Date().toISOString(),
        };
      },
    });

    const res = await NotificationService.sendEmail({
      to: 'custom@test.com',
      subject: 'Custom Provider Test',
      html: '<b>Hello</b>',
    });

    expect(customCalled).toBe(true);
    expect(res.provider).toBe('custom-mock-provider');

    // Reset back to ConsoleEmailProvider
    NotificationService.setEmailProvider(new ConsoleEmailProvider());
  });
});
