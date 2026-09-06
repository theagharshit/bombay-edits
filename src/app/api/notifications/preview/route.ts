import { NextRequest, NextResponse } from 'next/server';
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

// Sample mock data for live visual rendering
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const template = searchParams.get('template')?.toLowerCase();
  const format = searchParams.get('format')?.toLowerCase();

  // JSON summary: audit log and provider health
  if (format === 'json') {
    return NextResponse.json({
      activeEmailProvider: NotificationService.getEmailProviderName(),
      activeSmsProvider: NotificationService.getSmsProviderName(),
      auditLogCount: notificationDevAuditLog.length,
      recentDispatches: notificationDevAuditLog.slice(0, 20),
    });
  }

  // 1. Order Confirmation Email
  if (template === 'order-confirmation') {
    const rendered = renderOrderConfirmationEmail(sampleOrder);
    return new NextResponse(rendered.html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 2. Order Status Update Email
  if (template === 'order-status') {
    const status = searchParams.get('status') || 'dispatched';
    const rendered = renderOrderStatusEmail(sampleOrder, status);
    return new NextResponse(rendered.html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 3. Contact Concierge Inquiry Email
  if (template === 'contact') {
    const rendered = renderContactInquiryEmail(sampleSubmission);
    return new NextResponse(rendered.html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 4. Newsletter Welcome Email
  if (template === 'newsletter') {
    const rendered = renderNewsletterWelcomeEmail('collector@bombayedits.com');
    return new NextResponse(rendered.html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // SMS Text Previews
  if (template === 'sms-order-confirmation') {
    return new NextResponse(renderOrderConfirmationSms(sampleOrder), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  if (template === 'sms-order-status') {
    return new NextResponse(renderOrderStatusSms(sampleOrder, 'dispatched'), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  if (template === 'sms-contact') {
    return new NextResponse(renderContactInquirySms(sampleSubmission), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Index Hub: Sleek luxury dashboard preview
  const emailProvider = NotificationService.getEmailProviderName();
  const smsProvider = NotificationService.getSmsProviderName();
  const recentLogsHtml =
    notificationDevAuditLog.length === 0
      ? '<p style="color: #888; font-style: italic;">No notifications dispatched yet during this dev server lifecycle. Create an order, submit contact inquiry, or subscribe to newsletter to populate.</p>'
      : `<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace;">
        <thead>
          <tr style="background: #1e1e1e; color: #d4af37; text-align: left;">
            <th style="padding: 8px 12px;">Timestamp</th>
            <th style="padding: 8px 12px;">Channel</th>
            <th style="padding: 8px 12px;">Provider</th>
            <th style="padding: 8px 12px;">Recipient</th>
            <th style="padding: 8px 12px;">Status</th>
            <th style="padding: 8px 12px;">Message ID</th>
          </tr>
        </thead>
        <tbody>
          ${notificationDevAuditLog
            .map(
              (log) => `
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 8px 12px; color: #bbb;">${new Date(log.timestamp).toLocaleTimeString()}</td>
              <td style="padding: 8px 12px; color: ${log.channel === 'email' ? '#8bc34a' : '#03a9f4'}; font-weight: bold;">${log.channel.toUpperCase()}</td>
              <td style="padding: 8px 12px; color: #e0e0e0;">${log.provider}</td>
              <td style="padding: 8px 12px; color: #fff;">${log.recipient}</td>
              <td style="padding: 8px 12px; color: ${log.success ? '#4caf50' : '#f44336'};">${log.success ? '✓ DELIVERED' : '✗ FAILED'}</td>
              <td style="padding: 8px 12px; color: #888;">${log.messageId || log.error || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table></div>`;

  const hubHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>Notification Service Studio | The Bombay Edit</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        body { margin: 0; background: #0c0b09; color: #f4ede4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 24px; }
        .container { max-width: 1080px; margin: 0 auto; }
        .header { border-bottom: 1px solid #2a2521; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
        h1 { margin: 0 0 8px 0; font-family: 'Cinzel', Georgia, serif; font-size: 26px; letter-spacing: 0.12em; color: #d4af37; text-transform: uppercase; }
        .subtitle { margin: 0; font-size: 13px; color: #9c9186; letter-spacing: 0.05em; }
        .badge-strip { display: flex; gap: 12px; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: monospace; }
        .badge-email { background: #1a2517; border: 1px solid #38602b; color: #a4de8b; }
        .badge-sms { background: #0e2433; border: 1px solid #1a5175; color: #72c1f0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .card { background: #161412; border: 1px solid #2b2520; border-radius: 8px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease; }
        .card:hover { border-color: #d4af37; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .card h3 { margin: 0 0 8px 0; font-size: 16px; color: #f4ede4; letter-spacing: 0.05em; }
        .card p { font-size: 13px; color: #9c9186; margin: 0 0 16px 0; line-height: 1.5; flex-grow: 1; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #221d19; color: #d4af37; text-decoration: none; padding: 10px 16px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid #4a3e33; border-radius: 4px; transition: all 0.2s ease; }
        .btn:hover { background: #d4af37; color: #161412; border-color: #d4af37; }
        .btn-subtle { background: transparent; color: #bbb; border-color: #333; margin-top: 8px; }
        .btn-subtle:hover { background: #222; color: #fff; }
        .section-title { font-family: 'Cinzel', Georgia, serif; font-size: 18px; color: #e5ded3; letter-spacing: 0.08em; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px; }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #2a2521; }
        .audit-box { background: #141210; border: 1px solid #2a2521; border-radius: 8px; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <div>
            <h1>The Bombay Edit &bull; Notification Studio</h1>
            <p class="subtitle">Central Communications Architecture &bull; Luxury Email & Carrier-Compliant SMS Engine</p>
          </div>
          <div class="badge-strip">
            <div class="badge badge-email"><span>✉ Email:</span> <strong>${emailProvider}</strong></div>
            <div class="badge badge-sms"><span>📱 SMS:</span> <strong>${smsProvider}</strong></div>
          </div>
        </header>

        <h2 class="section-title">Responsive HTML Email Templates</h2>
        <div class="grid">
          <div class="card">
            <div>
              <h3>Acquisition Order Confirmation</h3>
              <p>Sent immediately upon successful checkout. Features customer details, order itemization table, ivory parchment background, and royal gold accents.</p>
            </div>
            <div>
              <a href="/api/notifications/preview?template=order-confirmation" target="_blank" class="btn">View Email HTML &rarr;</a>
              <a href="/api/notifications/preview?template=sms-order-confirmation" target="_blank" class="btn btn-subtle">View SMS Text &rarr;</a>
            </div>
          </div>

          <div class="card">
            <div>
              <h3>Order Status Update</h3>
              <p>Dispatched when an order transitions state (e.g. dispatched, in transit, delivered). Includes tracking number and courier details.</p>
            </div>
            <div>
              <a href="/api/notifications/preview?template=order-status&status=dispatched" target="_blank" class="btn">View Email HTML &rarr;</a>
              <a href="/api/notifications/preview?template=sms-order-status" target="_blank" class="btn btn-subtle">View SMS Text &rarr;</a>
            </div>
          </div>

          <div class="card">
            <div>
              <h3>Private Concierge Receipt</h3>
              <p>Acknowledges receipt of bespoke inquiries, trousseau consultations, and heritage commissions with dedicated inquiry reference IDs.</p>
            </div>
            <div>
              <a href="/api/notifications/preview?template=contact" target="_blank" class="btn">View Email HTML &rarr;</a>
              <a href="/api/notifications/preview?template=sms-contact" target="_blank" class="btn btn-subtle">View SMS Text &rarr;</a>
            </div>
          </div>

          <div class="card">
            <div>
              <h3>Newsletter Atelier Welcome</h3>
              <p>Welcomes new subscribers to private salon previews, archival drops, and heritage artisan stories with an editorial note.</p>
            </div>
            <div>
              <a href="/api/notifications/preview?template=newsletter" target="_blank" class="btn">View Email HTML &rarr;</a>
              <a href="/api/notifications/preview?format=json" target="_blank" class="btn btn-subtle">View Audit JSON &rarr;</a>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 class="section-title" style="margin-bottom: 0;">Live Dispatch Audit Trail (Real-Time & Persisted)</h2>
          <button onclick="window.location.reload()" style="background: #221d19; color: #d4af37; border: 1px solid #4a3e33; padding: 6px 14px; font-size: 11px; text-transform: uppercase; cursor: pointer; border-radius: 4px; letter-spacing: 0.08em;">↻ Refresh Logs</button>
        </div>
        <div class="audit-box">
          ${recentLogsHtml}
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(hubHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
