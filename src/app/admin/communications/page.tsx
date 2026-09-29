import { requireAdmin } from '@/lib/admin/auth';
import {
  NotificationService,
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
import { CommunicationsClient, TemplateData, AuditLogItem } from './CommunicationsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Communications & Messages | Admin' };

// Sample mock data for atelier preview rendering
const sampleOrder: OrderRecord = {
  id: 'preview-ord-001',
  orderId: 'preview-ord-001',
  orderNumber: 'TBE-2026-9042',
  currency: 'INR',
  customer: {
    firstName: 'Anya',
    lastName: 'Singhania',
    email: 'anya.singhania@heritage.in',
    phone: '+91 98200 12345',
    address: '14 Altamount Road, Cumballa Hill',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400026',
    country: 'India',
  },
  items: [
    {
      productId: 'prod_zari_01',
      slug: 'pure-zari-benarasi',
      name: 'Hand-Woven Pure Zari Benarasi Saree',
      price: 34500,
      quantity: 1,
      size: 'Free Size',
      colour: 'Crimson Gold',
    },
    {
      productId: 'prod_shawl_02',
      slug: 'royal-pashmina-jamawar',
      name: 'Royal Pashmina Jamawar Stole',
      price: 18500,
      quantity: 1,
      size: 'Standard',
      colour: 'Ivory Antique',
    },
  ],
  shippingZone: 'Express Concierge Courier (Complimentary)',
  shippingCost: 0,
  subtotal: 53000,
  total: 53000,
  paymentMethod: 'Prepaid Royal Escrow',
  status: 'confirmed',
  trackingNumber: 'TBE-FEDEX-998822',
  notes: 'Fragrant sandalwood packaging requested.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleSubmission: ContactSubmission = {
  id: 'inq_preview_77',
  name: 'Devraj Oberoi',
  email: 'devraj.oberoi@palace.com',
  phone: '+91 98110 54321',
  subject: 'Bespoke Atelier Bridal Commission',
  message:
    'We are curating the bridal trousseau for an upcoming wedding in Udaipur and would like a private consultation with your senior master weaver in Bombay.',
  orderNumber: 'TBE-2026-9042',
  status: 'new',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default async function AdminCommunicationsPage() {
  await requireAdmin();

  const orderConfEmail = renderOrderConfirmationEmail(sampleOrder);
  const orderStatusEmail = renderOrderStatusEmail(sampleOrder, 'dispatched');
  const contactEmail = renderContactInquiryEmail(sampleSubmission);
  const newsletterEmail = renderNewsletterWelcomeEmail('patron@bombayedits.com');

  const orderConfSms = renderOrderConfirmationSms(sampleOrder);
  const orderStatusSms = renderOrderStatusSms(sampleOrder, 'dispatched');
  const contactSms = renderContactInquirySms(sampleSubmission);

  const initialTemplates: Record<string, TemplateData> = {
    'contact-acknowledgment': {
      id: 'contact-acknowledgment',
      title: 'Bespoke Consultation Acknowledgment',
      category: 'Atelier Concierge',
      description:
        'Instant receipt confirming ticket creation. Informs client that full bespoke consultation proceeds via email.',
      subject: contactEmail.subject,
      emailHtml: contactEmail.html,
      emailText: contactEmail.text,
      smsText: contactSms,
      recipientEmail: sampleSubmission.email,
      recipientPhone: sampleSubmission.phone || null,
    },
    'order-confirmation': {
      id: 'order-confirmation',
      title: 'Acquisition Order Confirmation',
      category: 'Orders & Acquisitions',
      description:
        'Sent immediately upon confirmed payment with itemization table, address, and royal gold accents.',
      subject: orderConfEmail.subject,
      emailHtml: orderConfEmail.html,
      emailText: orderConfEmail.text,
      smsText: orderConfSms,
      recipientEmail: sampleOrder.customer.email,
      recipientPhone: sampleOrder.customer.phone || null,
    },
    'order-status': {
      id: 'order-status',
      title: 'Consignment Dispatched / In Transit',
      category: 'Fulfillment & Logistics',
      description:
        'Dispatched when logistics package transitions status. Includes courier partner, live tracking, and dispatch note.',
      subject: orderStatusEmail.subject,
      emailHtml: orderStatusEmail.html,
      emailText: orderStatusEmail.text,
      smsText: orderStatusSms,
      recipientEmail: sampleOrder.customer.email,
      recipientPhone: sampleOrder.customer.phone || null,
    },
    'newsletter-welcome': {
      id: 'newsletter-welcome',
      title: 'Gazette Patron Welcome Editorial',
      category: 'Editorial & Circle',
      description:
        'Welcomes new subscribers to private salon previews, archival drops, and heritage artisan stories.',
      subject: newsletterEmail.subject,
      emailHtml: newsletterEmail.html,
      emailText: newsletterEmail.text,
      smsText: null,
      recipientEmail: 'collector@bombayedits.com',
      recipientPhone: null,
    },
  };

  const initialProviders = {
    email: NotificationService.getEmailProviderName(),
    sms: NotificationService.getSmsProviderName(),
  };

  const sortedDevLogs = [...notificationDevAuditLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const initialLogs: AuditLogItem[] = sortedDevLogs.map((item, idx) => ({
    id: `${item.messageId || 'log'}-${item.timestamp}-${idx}`,
    channel: item.channel,
    provider: item.provider,
    recipient: item.recipient,
    status: item.success ? 'dispatched' : 'failed',
    timestamp: item.timestamp,
    error: item.error,
  }));

  return (
    <CommunicationsClient
      initialTemplates={initialTemplates}
      initialProviders={initialProviders}
      initialLogs={initialLogs}
    />
  );
}
