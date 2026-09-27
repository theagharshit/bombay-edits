import { OrderRecord } from '@/backend/models/orderModel';
import { ContactSubmission } from '@/backend/models/contactModel';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://houseofbaneri.com';

export function renderOrderConfirmationSms(order: OrderRecord): string {
  const currencySymbol = order.currency === 'INR' ? '₹' : 'Rs.';
  const trackingUrl = `${BASE_URL}/account/orders/${order.orderNumber}`;
  return `House of Baneri: Order #${order.orderNumber} confirmed (${currencySymbol}${order.total.toLocaleString()}). Preparing your atelier piece. Track: ${trackingUrl}`;
}

export function renderOrderStatusSms(order: OrderRecord, newStatus: string): string {
  const trackingUrl = `${BASE_URL}/account/orders/${order.orderNumber}`;
  const statusLabel = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
  return `House of Baneri: Order #${order.orderNumber} is now ${statusLabel}. Delivery to ${order.customer.city}. Track: ${trackingUrl}`;
}

export function renderContactInquirySms(submission: ContactSubmission): string {
  const ticketRef = submission.id || 'INQ';
  return `House of Baneri: Hello ${submission.name}, inquiry #${ticketRef} received. Our concierge will be in touch shortly.`;
}
