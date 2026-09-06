import { OrderRecord } from '@/backend/models/orderModel';
import { ContactSubmission } from '@/backend/models/contactModel';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://thebombayedit.com';

function baseEmailLayout(content: string, preheaderText = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Bombay Edit</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F7F5F0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1C1917;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      display: block;
      outline: none;
      text-decoration: none;
    }
    a {
      color: #722F37;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 16px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #F7F5F0;">
  <!-- Preheader text for inbox preview -->
  <span style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">
    ${preheaderText}
  </span>

  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F5F0;">
      <tr>
        <td align="center">
          <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="width: 600px; max-width: 600px; background-color: #FAF8F5; border: 1px solid #E7E2DA; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
            
            <!-- Top Gold Trim Accent Line -->
            <tr>
              <td style="height: 3px; background: linear-gradient(90deg, #722F37, #D4AF37, #722F37);"></td>
            </tr>

            <!-- Atelier Header Wordmark -->
            <tr>
              <td align="center" style="padding: 36px 24px 24px 24px; border-bottom: 1px solid #E7E2DA;">
                <a href="${BASE_URL}" target="_blank" style="text-decoration: none;">
                  <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 500; letter-spacing: 0.05em; color: #1C1917; text-transform: uppercase;">
                    The Bombay Edit
                  </h1>
                </a>
                <p style="margin: 6px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8C827A;">
                  Indian Craft, Reimagined
                </p>
              </td>
            </tr>

            <!-- Main Content Area -->
            <tr>
              <td style="padding: 36px 32px;">
                ${content}
              </td>
            </tr>

            <!-- Atelier Footer & Concierge Links -->
            <tr>
              <td style="background-color: #F4EFEA; padding: 28px 32px; border-top: 1px solid #E7E2DA; text-align: center;">
                <p style="margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #57534E;">
                  Client Concierge & Atelier Assistance
                </p>
                <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.6; color: #78716C;">
                  Need bespoke alterations, styling advice, or order assistance?<br>
                  Reach our client care at <a href="mailto:support@thebombayedit.com" style="color: #722F37; font-weight: 500;">support@thebombayedit.com</a>
                  or via WhatsApp concierge.
                </p>
                <div style="margin: 0 0 16px 0;">
                  <a href="${BASE_URL}/shop" style="display: inline-block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #1C1917; margin: 0 8px;">Shop</a>
                  <span style="color: #D6D3D1;">•</span>
                  <a href="${BASE_URL}/consultations" style="display: inline-block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #1C1917; margin: 0 8px;">Bespoke</a>
                  <span style="color: #D6D3D1;">•</span>
                  <a href="${BASE_URL}/the-craft" style="display: inline-block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #1C1917; margin: 0 8px;">The Craft</a>
                  <span style="color: #D6D3D1;">•</span>
                  <a href="${BASE_URL}/account" style="display: inline-block; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #1C1917; margin: 0 8px;">Atelier Portal</a>
                </div>
                <p style="margin: 0; font-size: 11px; color: #A8A29E;">
                  © ${new Date().getFullYear()} The Bombay Edit. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

/**
 * 1. Order Confirmation Email
 */
export function renderOrderConfirmationEmail(order: OrderRecord): {
  subject: string;
  html: string;
  text: string;
} {
  const customerName =
    `${order.customer.firstName} ${order.customer.lastName}`.trim() || 'Valued Patron';
  const currencySymbol = order.currency === 'INR' ? '₹' : order.currency === 'USD' ? '$' : 'Rs. ';
  const formattedTotal = `${currencySymbol}${order.total.toLocaleString()}`;
  const trackingUrl = `${BASE_URL}/account/orders/${order.orderId || order.orderNumber}?email=${encodeURIComponent(order.customer.email)}`;

  const itemsRows = order.items
    .map((item) => {
      const title =
        (item as { name?: string; title?: string }).name ||
        (item as { name?: string; title?: string }).title ||
        'Artisanal Creation';
      const metaParts: string[] = [];
      if (item.size) metaParts.push(`Size: ${item.size}`);
      if (item.colour) metaParts.push(`Shade: ${item.colour}`);
      metaParts.push(`Qty: ${item.quantity}`);

      return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E7E2DA;">
          <strong style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; color: #1C1917;">
            ${title}
          </strong>
          <div style="font-size: 12px; color: #78716C; margin-top: 2px;">
            ${metaParts.join(' | ')}
          </div>
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #E7E2DA; font-size: 14px; font-weight: 500; color: #1C1917;">
          ${currencySymbol}${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `;
    })
    .join('');

  const content = `
    <h2 style="margin: 0 0 12px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 500; color: #1C1917; text-align: center;">
      Order Confirmed: #${order.orderNumber}
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534E; text-align: center;">
      Thank you, <strong>${customerName}</strong>. Your artisanal commission has been received by our Bombay atelier and is currently being prepared for dispatch.
    </p>

    <!-- Order Metadata Box -->
    <table role="presentation" width="100%" style="background-color: #FFFFFF; border: 1px solid #E7E2DA; padding: 16px; margin-bottom: 28px;">
      <tr>
        <td style="padding: 12px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A;">Order Reference</div>
          <div style="font-family: monospace; font-size: 15px; font-weight: 600; color: #722F37; margin-top: 2px;">#${order.orderNumber}</div>
        </td>
        <td style="padding: 12px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A;">Payment Method</div>
          <div style="font-size: 13px; font-weight: 500; color: #1C1917; margin-top: 2px;">${order.paymentMethod || 'Online Payment'}</div>
        </td>
        <td style="padding: 12px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A;">Status</div>
          <div style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #065F46; background-color: #ECFDF5; padding: 2px 8px; border: 1px solid #A7F3D0; margin-top: 2px;">
            Confirmed
          </div>
        </td>
      </tr>
    </table>

    <!-- Line Items Table -->
    <table role="presentation" width="100%" style="margin-bottom: 24px;">
      <thead>
        <tr>
          <th align="left" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A; padding-bottom: 8px; border-bottom: 2px solid #1C1917;">Creations</th>
          <th align="right" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A; padding-bottom: 8px; border-bottom: 2px solid #1C1917;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Totals Breakdown -->
    <table role="presentation" width="100%" style="margin-bottom: 28px;">
      <tr>
        <td style="padding: 4px 0; font-size: 13px; color: #57534E;">Subtotal</td>
        <td align="right" style="padding: 4px 0; font-size: 13px; color: #1C1917;">${currencySymbol}${order.subtotal.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; font-size: 13px; color: #57534E;">White-Glove Courier Delivery</td>
        <td align="right" style="padding: 4px 0; font-size: 13px; color: #1C1917;">
          ${order.shippingCost === 0 ? 'Complimentary' : `${currencySymbol}${order.shippingCost.toLocaleString()}`}
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0 4px 0; font-size: 16px; font-weight: 600; color: #1C1917; border-top: 1px solid #1C1917;">Total Amount</td>
        <td align="right" style="padding: 12px 0 4px 0; font-size: 16px; font-weight: 600; color: #722F37; border-top: 1px solid #1C1917;">${formattedTotal}</td>
      </tr>
    </table>

    <!-- Shipping Destination -->
    <div style="background-color: #FFFFFF; border: 1px solid #E7E2DA; padding: 16px; margin-bottom: 28px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A; margin-bottom: 4px;">Delivery Destination</div>
      <div style="font-size: 13px; color: #1C1917; line-height: 1.5;">
        ${order.customer.address}<br>
        ${order.customer.city}${order.customer.state ? `, ${order.customer.state}` : ''} ${order.customer.postalCode || ''}<br>
        ${order.customer.country || 'Nepal'}
      </div>
      <div style="font-size: 12px; color: #78716C; margin-top: 6px;">
        Contact: ${order.customer.phone || 'N/A'}
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 12px;">
      <a href="${trackingUrl}" style="display: inline-block; background-color: #1C1917; color: #FAF8F5; padding: 14px 32px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; font-weight: 500;">
        View & Track Your Order →
      </a>
    </div>
  `;

  const subject = `Order Confirmed: #${order.orderNumber} — The Bombay Edit`;
  const text = `Thank you for your order #${order.orderNumber} with The Bombay Edit. Total: ${formattedTotal}. View order details: ${trackingUrl}`;

  return {
    subject,
    html: baseEmailLayout(
      content,
      `Order #${order.orderNumber} confirmed. Total: ${formattedTotal}.`
    ),
    text,
  };
}

/**
 * 2. Order Status Update Email (Shipped / Out for Delivery / Delivered)
 */
export function renderOrderStatusEmail(
  order: OrderRecord,
  newStatus: string
): { subject: string; html: string; text: string } {
  const customerName =
    `${order.customer.firstName} ${order.customer.lastName}`.trim() || 'Valued Patron';
  const trackingUrl = `${BASE_URL}/account/orders/${order.orderId || order.orderNumber}?email=${encodeURIComponent(order.customer.email)}`;

  const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

  const content = `
    <h2 style="margin: 0 0 12px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 500; color: #1C1917; text-align: center;">
      Order Update: #${order.orderNumber} is now ${statusLabel}
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534E; text-align: center;">
      Dear <strong>${customerName}</strong>, your order #${order.orderNumber} has progressed to <strong>${statusLabel}</strong>.
    </p>

    <div style="background-color: #FFFFFF; border: 1px solid #E7E2DA; padding: 20px; text-align: center; margin-bottom: 28px;">
      <span style="display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #722F37; background-color: #FAF2F3; border: 1px solid #E4CDD0; padding: 6px 16px;">
        Status: ${statusLabel}
      </span>
      ${
        order.trackingNumber
          ? `
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #57534E;">
        Consignment Tracking: <strong style="font-family: monospace; color: #1C1917;">${order.trackingNumber}</strong>
      </p>`
          : ''
      }
      <p style="margin: 12px 0 0 0; font-size: 13px; color: #78716C;">
        Your handcrafted creations are en route to your specified address in ${order.customer.city}.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 12px;">
      <a href="${trackingUrl}" style="display: inline-block; background-color: #1C1917; color: #FAF8F5; padding: 14px 32px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; font-weight: 500;">
        Track Live Delivery Progress →
      </a>
    </div>
  `;

  const subject = `Order #${order.orderNumber} Status: ${statusLabel} — The Bombay Edit`;
  const text = `Your order #${order.orderNumber} has been updated to ${statusLabel}. Track your order here: ${trackingUrl}`;

  return {
    subject,
    html: baseEmailLayout(content, `Order #${order.orderNumber} is now ${statusLabel}.`),
    text,
  };
}

/**
 * 3. Contact / Concierge Inquiry Acknowledgment Email
 */
export function renderContactInquiryEmail(submission: ContactSubmission): {
  subject: string;
  html: string;
  text: string;
} {
  const ticketRef = submission.id || 'INQ-' + Date.now().toString().slice(-6);

  const content = `
    <h2 style="margin: 0 0 12px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 500; color: #1C1917; text-align: center;">
      Inquiry Received
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #57534E; text-align: center;">
      Hello <strong>${submission.name}</strong>, thank you for contacting The Bombay Edit Atelier. Our client concierge has received your note regarding <strong>${submission.subject || 'General Inquiry'}</strong>.
    </p>

    <div style="background-color: #FFFFFF; border: 1px solid #E7E2DA; padding: 18px; margin-bottom: 24px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A; margin-bottom: 2px;">Inquiry Reference</div>
      <div style="font-family: monospace; font-size: 14px; font-weight: 600; color: #722F37; margin-bottom: 12px;">#${ticketRef}</div>

      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C827A; margin-bottom: 2px;">Your Message</div>
      <div style="font-size: 13px; color: #1C1917; line-height: 1.5; font-style: italic; background-color: #FAF8F5; padding: 10px; border-left: 2px solid #722F37;">
        &ldquo;${submission.message}&rdquo;
      </div>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #78716C; text-align: center; margin-bottom: 24px;">
      Our master styling and concierge team will review your details and respond within 24 business hours.
    </p>

    <div style="text-align: center;">
      <a href="${BASE_URL}/contact" style="display: inline-block; background-color: #1C1917; color: #FAF8F5; padding: 12px 28px; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; font-weight: 500;">
        Visit Concierge Portal
      </a>
    </div>
  `;

  const subject = `Inquiry Acknowledged: #${ticketRef} — The Bombay Edit Concierge`;
  const text = `Hello ${submission.name}, we have received your inquiry #${ticketRef} regarding "${submission.subject}". Our concierge will contact you within 24 hours.`;

  return {
    subject,
    html: baseEmailLayout(
      content,
      `Inquiry #${ticketRef} received. Our concierge will be in touch shortly.`
    ),
    text,
  };
}

/**
 * 4. Newsletter Welcome Email
 */
export function renderNewsletterWelcomeEmail(email: string): {
  subject: string;
  html: string;
  text: string;
} {
  const content = `
    <h2 style="margin: 0 0 12px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 500; color: #1C1917; text-align: center;">
      Welcome to The Bombay Edit Gazette
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #57534E; text-align: center;">
      We are delighted to welcome <strong>${email}</strong> into our private circle of collectors and patrons. As a subscriber, you will receive first access to Private Salon Previews, seasonal capsules, textile stories, and invitation-only pre-orders.
    </p>

    <div style="border-top: 1px solid #E7E2DA; border-bottom: 1px solid #E7E2DA; padding: 20px 0; margin-bottom: 28px; text-align: center;">
      <p style="margin: 0 0 6px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-style: italic; color: #1C1917;">
        &ldquo;Indian craft, reimagined for the contemporary silhouette.&rdquo;
      </p>
      <p style="margin: 0; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #8C827A;">
        Curated in Bombay • Handcrafted for Nepal
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${BASE_URL}/collections/signature" style="display: inline-block; background-color: #1C1917; color: #FAF8F5; padding: 14px 32px; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; font-weight: 500;">
        Explore The Signature Edit →
      </a>
    </div>
  `;

  const subject = `Welcome to The Gazette — The Bombay Edit`;
  const text = `Welcome to The Bombay Edit Gazette. You are now part of our private collector circle. Explore our collections at ${BASE_URL}/shop`;

  return {
    subject,
    html: baseEmailLayout(
      content,
      'Welcome to The Bombay Edit Gazette. Private previews and seasonal edits await.'
    ),
    text,
  };
}
