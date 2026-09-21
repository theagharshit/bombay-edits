'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatMoney } from '@/lib/admin/money';
import { updateOrderStatus, updateOrderNotes } from '@/app/actions/admin/orders';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ConfirmDialog } from '@/app/admin/_components/ConfirmDialog';

export type OrderDetailItem = {
  id: string;
  productId: string | null;
  productNameSnapshot: string;
  productSkuSnapshot?: string | null;
  sizeCodeSnapshot?: string | null;
  colourNameSnapshot?: string | null;
  imageUrlSnapshot?: string | null;
  unitPrice: number;
  quantity: number;
};

export type OrderStatusEvent = {
  id: string;
  createdAt: Date | string;
  toStatus: string;
  actorId?: string | null;
  note?: string | null;
};

export type OrderDetailData = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: Date | string;
  currency: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  exchangeRateSnapshot?: number | null;
  internalNotes?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry: string;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerId?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  items: OrderDetailItem[];
  statusEvents: OrderStatusEvent[];
};

type OrderDetailProps = {
  order: OrderDetailData;
  customerStats: { ltv: number; orderCount: number };
};

function StatusBadge({ status }: { status: string }) {
  let color = 'bg-gray-100 text-gray-800';
  if (status === 'new') color = 'bg-blue-100 text-blue-800';
  if (status === 'confirmed') color = 'bg-yellow-100 text-yellow-800';
  if (status === 'shipped') color = 'bg-purple-100 text-purple-800';
  if (status === 'delivered') color = 'bg-green-100 text-green-800';
  if (status === 'cancelled') color = 'bg-red-100 text-red-800';
  return (
    <span
      className={`px-2 py-1 text-[11px] uppercase tracking-wider rounded-full font-medium ${color}`}
    >
      {status}
    </span>
  );
}

export function OrderDetailClient({ order, customerStats }: OrderDetailProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.carrier || '');

  const handleStatusChange = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to update status`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkShipped = async () => {
    if (!trackingNumber && !confirm('Mark as shipped without a tracking number?')) return;
    setIsProcessing(true);
    try {
      await updateOrderStatus(order.id, 'shipped', undefined, trackingNumber, carrier);
      toast.success('Order marked as shipped');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to ship order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsProcessing(true);
    try {
      await updateOrderNotes(order.id, internalNotes);
      toast.success('Notes saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAddress = () => {
    const text = `${order.shippingAddress}\n${order.shippingCity}, ${order.shippingState || ''} ${order.shippingPostalCode || ''}\n${order.shippingCountry}`;
    navigator.clipboard.writeText(text.trim());
    toast.success('Address copied to clipboard');
  };

  const canCancel = order.status === 'new' || order.status === 'confirmed';

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="text-gray-500 hover:text-black">
            ← Back
          </Link>
          <h1 className="text-2xl font-[var(--font-jost)] font-semibold">
            Order {order.orderNumber}
          </h1>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/admin/orders/${order.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
          >
            Print Packing Slip
          </a>
          {canCancel && (
            <ConfirmDialog
              trigger={
                <button className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm">
                  Cancel Order
                </button>
              }
              title="Cancel Order"
              description="Are you sure you want to cancel this order? This will restock all items and write a cancellation inventory movement."
              confirmLabel="Yes, Cancel Order"
              onConfirm={() => handleStatusChange('cancelled')}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* RIGHT COLUMN ON DESKTOP, TOP ON MOBILE */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 order-1 md:order-2">
          {/* FULFILMENT CARD */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Fulfilment</h2>
            {order.status === 'shipped' || order.status === 'delivered' ? (
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-500 block mb-1">Status</span>
                  <span className="font-medium">
                    {order.status === 'shipped' ? 'Shipped' : 'Delivered'}
                  </span>
                </div>
                {order.carrier && (
                  <div className="text-sm">
                    <span className="text-gray-500 block mb-1">Carrier</span>
                    <span className="font-medium">{order.carrier}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="text-sm">
                    <span className="text-gray-500 block mb-1">Tracking Number</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
                {order.status === 'shipped' && (
                  <button
                    onClick={() => handleStatusChange('delivered')}
                    disabled={isProcessing}
                    className="w-full mt-2 px-4 py-2 border rounded text-sm hover:bg-gray-50"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            ) : order.status === 'cancelled' ? (
              <div className="text-red-600 text-sm">Order was cancelled.</div>
            ) : (
              <div className="space-y-4">
                {order.status === 'new' && (
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border border-[var(--admin-accent)] text-[var(--admin-accent)] rounded text-sm hover:bg-gray-50"
                  >
                    Mark Confirmed
                  </button>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Carrier (optional)</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                    placeholder="e.g. DHL, FedEx"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tracking Number (optional)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <button
                  onClick={handleMarkShipped}
                  disabled={
                    isProcessing || (order.status !== 'confirmed' && order.status !== 'new')
                  }
                  className="w-full px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
                >
                  Mark Shipped
                </button>
              </div>
            )}
          </div>

          {/* CUSTOMER CARD */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Customer</h2>
            <div className="space-y-1">
              <div className="font-medium">
                {order.customerId ? (
                  <Link
                    href={`/admin/customers/${order.customerId}`}
                    className="text-[var(--admin-accent)] hover:underline"
                  >
                    {order.customerFirstName} {order.customerLastName}
                  </Link>
                ) : (
                  <span>
                    {order.customerFirstName} {order.customerLastName} (Guest)
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <a href={`mailto:${order.customerEmail}`} className="hover:underline">
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div className="text-sm text-gray-600">{order.customerPhone}</div>
              )}
              {order.customerId && (
                <div className="text-xs text-gray-500 mt-2">
                  {customerStats.orderCount} orders • LTV: {formatMoney(customerStats.ltv, 'NPR')}
                </div>
              )}
            </div>
          </div>

          {/* SHIPPING ADDRESS */}
          <div className="bg-white border rounded shadow-sm p-5 relative">
            <button
              onClick={handleCopyAddress}
              className="absolute top-4 right-4 text-xs text-blue-600 hover:underline"
            >
              Copy
            </button>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Shipping Address</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                {order.customerFirstName} {order.customerLastName}
              </div>
              <div>{order.shippingAddress}</div>
              <div>
                {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
              </div>
              <div>{order.shippingCountry}</div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Payment</h2>
            <div className="text-sm flex justify-between">
              <span className="text-gray-600">Method</span>
              <span className="font-medium capitalize">{order.paymentMethod}</span>
            </div>
            <div className="text-sm flex justify-between mt-2">
              <span className="text-gray-600">Status</span>
              <span className="font-medium capitalize">{order.paymentStatus}</span>
            </div>
          </div>

          {/* INTERNAL NOTES */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Internal Notes</h2>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add private notes here..."
              className="w-full border rounded p-2 text-sm min-h-[100px] mb-2"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isProcessing || internalNotes === (order.internalNotes || '')}
              className="w-full px-4 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Save Notes
            </button>
          </div>
        </div>

        {/* LEFT COLUMN ON DESKTOP, BOTTOM ON MOBILE */}
        <div className="w-full md:w-2/3 flex flex-col gap-6 order-2 md:order-1">
          {/* LINE ITEMS */}
          <div className="bg-white border rounded shadow-sm overflow-hidden">
            <h2 className="text-lg font-semibold p-5 border-b">Line Items</h2>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 flex items-start gap-4">
                  {item.imageUrlSnapshot ? (
                    <Image
                      src={item.imageUrlSnapshot}
                      alt={item.productNameSnapshot}
                      width={60}
                      height={80}
                      className="object-cover rounded bg-gray-100"
                    />
                  ) : (
                    <div className="w-[60px] h-[80px] bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      No Img
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      {item.productId ? (
                        <Link
                          href={`/admin/products/${item.productId}`}
                          className="font-medium text-[var(--admin-accent)] hover:underline"
                        >
                          {item.productNameSnapshot}
                        </Link>
                      ) : (
                        <span className="font-medium">{item.productNameSnapshot}</span>
                      )}
                      <span className="font-medium">
                        {formatMoney(item.unitPrice * item.quantity, order.currency)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.productSkuSnapshot && (
                        <span className="mr-3">SKU: {item.productSkuSnapshot}</span>
                      )}
                      {item.sizeCodeSnapshot && (
                        <span className="mr-3">Size: {item.sizeCodeSnapshot}</span>
                      )}
                      {item.colourNameSnapshot && <span>Colour: {item.colourNameSnapshot}</span>}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatMoney(item.unitPrice, order.currency)} × {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* COST BREAKDOWN */}
            <div className="p-5 border-t bg-gray-50 flex flex-col items-end gap-2 text-sm">
              <div className="flex justify-between w-64">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatMoney(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between w-64">
                <span className="text-gray-600">Shipping</span>
                <span>{formatMoney(order.shippingCost, order.currency)}</span>
              </div>
              <div className="flex justify-between w-64 font-semibold text-lg mt-2 pt-2 border-t">
                <span>Total</span>
                <span>{formatMoney(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Timeline</h2>
            {order.statusEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No status events found.</p>
            ) : (
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
                {order.statusEvents.map((event) => (
                  <div key={event.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--admin-accent)]"></div>
                    <div className="text-sm font-medium">
                      Status changed to {event.toStatus.toUpperCase()}
                    </div>
                    <div
                      className="text-xs text-gray-500 mt-1"
                      title={new Date(event.createdAt).toLocaleString()}
                    >
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })} by{' '}
                      {event.actorId || 'System'}
                    </div>
                    {event.note && (
                      <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2 border border-gray-100">
                        {event.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
