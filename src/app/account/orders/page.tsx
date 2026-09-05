'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/frontend/components/ui/Badge';
import { Button } from '@/frontend/components/ui/Button';
import { generatePlaceholderImage } from '@/frontend/utils/imageUtils';
import { OrderService } from '@/frontend/services/orderService';
import { OrderRecord } from '@/backend/models/orderModel';

import { useAuth } from '@/frontend/context/AuthContext';

function OrdersContent() {
  const { customer, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const urlOrderNum = searchParams.get('orderNumber') || '';
  const urlEmail = searchParams.get('email') || '';

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guestOrderNum, setGuestOrderNum] = useState(urlOrderNum);
  const [guestEmail, setGuestEmail] = useState(urlEmail);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (authLoading) return;

      if (!isAuthenticated || !customer) {
        setLoading(false);
        // If guest arrives with order number and email in URL, automatically perform lookup
        if (urlOrderNum && urlEmail) {
          setGuestLoading(true);
          setGuestError(null);
          try {
            const res = await fetch(
              `/api/orders?orderNumber=${encodeURIComponent(
                urlOrderNum.trim()
              )}&email=${encodeURIComponent(urlEmail.trim().toLowerCase())}`
            );
            const json = await res.json();
            if (res.ok && json.data && Array.isArray(json.data) && json.data.length > 0) {
              setOrders(json.data);
            } else {
              setGuestError('No order found matching this order number and email.');
            }
          } catch {
            setGuestError('Failed to lookup guest order.');
          } finally {
            setGuestLoading(false);
          }
        }
        return;
      }

      try {
        setLoading(true);
        const data = await OrderService.getOrders({ email: customer.email });
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch purchase history:', err);
        setError('Failed to load your purchase history.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [customer, isAuthenticated, authLoading, urlOrderNum, urlEmail]);

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestOrderNum.trim() || !guestEmail.trim()) {
      setGuestError('Please enter both your order number and contact email.');
      return;
    }
    setGuestLoading(true);
    setGuestError(null);
    try {
      const res = await fetch(
        `/api/orders?orderNumber=${encodeURIComponent(
          guestOrderNum.trim()
        )}&email=${encodeURIComponent(guestEmail.trim().toLowerCase())}`
      );
      const json = await res.json();
      if (res.ok && json.data && Array.isArray(json.data) && json.data.length > 0) {
        setOrders(json.data);
      } else {
        setGuestError('No order found matching this order number and email.');
      }
    } catch {
      setGuestError('Failed to lookup guest order.');
    } finally {
      setGuestLoading(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shipped':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'processing':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="container-site section-padding max-w-4xl mx-auto font-body">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-taupe mb-8">
        <Link href="/account" className="hover:text-dark-espresso transition-colors">
          Account
        </Link>
        <span>/</span>
        <span className="text-dark-espresso">Order History</span>
      </div>

      <div className="border-b border-beige-line pb-6 mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-dark-espresso mb-1">Order History</h1>
        <p className="text-[13px] text-chocolate-brown">
          Review past couture acquisitions, track consignments, and access invoices directly from
          database.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-cream/40 border border-beige-line p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dark-espresso mb-4" />
          <p className="text-[13px] text-chocolate-brown">Fetching acquisitions from database...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 border border-red-200 p-8 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        !isAuthenticated ? (
          <div className="bg-cream/40 border border-beige-line p-8 sm:p-12 text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A817C] mb-2 block font-medium">
              Guest Order Tracking
            </span>
            <h2 className="font-display text-2xl text-dark-espresso mb-3">
              Track Your Consignment
            </h2>
            <p className="text-[13px] text-chocolate-brown mb-8 leading-relaxed">
              Purchased as a guest without an account? Enter your consignment order number below to
              view items, status, and shipping destination.
            </p>

            <form onSubmit={handleGuestLookup} className="space-y-4 text-left max-w-md mx-auto">
              {guestError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
                  {guestError}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-1 font-medium">
                  Order Number
                </label>
                <input
                  type="text"
                  required
                  value={guestOrderNum}
                  onChange={(e) => setGuestOrderNum(e.target.value)}
                  placeholder="e.g. TBE-2026-89329"
                  className="w-full bg-[#FAF6F0] border border-beige-line px-4 py-3 text-[13px] text-dark-espresso font-mono focus:outline-none focus:border-dark-espresso rounded-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-1 font-medium">
                  Billing / Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="email used at checkout"
                  className="w-full bg-[#FAF6F0] border border-beige-line px-4 py-3 text-[13px] text-dark-espresso focus:outline-none focus:border-dark-espresso rounded-none"
                />
              </div>

              <button
                type="submit"
                disabled={guestLoading}
                className="w-full py-3.5 bg-dark-espresso text-cream text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-chocolate-brown disabled:opacity-50 transition-colors cursor-pointer rounded-none"
              >
                {guestLoading ? 'Locating Order...' : 'Look Up Order'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-beige-line text-[12px] text-chocolate-brown">
              <span>Have an account? </span>
              <Link
                href="/account"
                className="text-dark-espresso font-semibold underline underline-offset-4"
              >
                Sign in to view full purchase archives
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-cream border border-beige-line p-8">
            <p className="font-display text-xl text-dark-espresso mb-2">No Past Orders</p>
            <p className="text-[13px] text-chocolate-brown mb-6">
              You haven't placed any orders with The Bombay Edit yet.
            </p>
            <Link href="/shop">
              <Button variant="primary" size="sm">
                Explore The Collection
              </Button>
            </Link>
          </div>
        )
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const formattedTotal = `Rs. ${order.total.toLocaleString('en-IN')}`;
            const shippingAddressStr = order.customer
              ? `${order.customer.address}, ${order.customer.city}`
              : 'Stored Address';

            return (
              <div
                key={order.orderId || order.orderNumber}
                className="border border-beige-line bg-cream/40 p-6 md:p-8"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-beige-line pb-6 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display text-xl text-dark-espresso font-medium">
                        {order.orderNumber}
                      </span>
                      <Badge variant={order.status === 'delivered' ? 'muted' : 'gold'}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <span className="text-[12px] text-muted-taupe">
                      Placed on {formatDate(order.createdAt)} • Ships to {shippingAddressStr}
                    </span>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted-taupe block">
                      Total Amount
                    </span>
                    <span className="font-display text-xl text-dark-espresso font-medium">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={item.productId || `${order.orderNumber}-${idx}`}
                      className="flex items-center gap-4 bg-cream/60 border border-beige-line/50 p-4"
                    >
                      <div className="relative w-16 h-20 bg-sand flex-shrink-0">
                        <Image
                          src={generatePlaceholderImage(300, 400, item.slug || 'product')}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.slug}`}
                          className="font-display text-base text-dark-espresso hover:text-champagne-gold transition-colors truncate block"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[12px] text-chocolate-brown block">
                          Size: {item.size} • Colour: {item.colour} • Qty: {item.quantity}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[13px] font-medium text-dark-espresso">
                          Rs. {item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-beige-line">
                  <div className="text-[12px] text-chocolate-brown">
                    <span>Payment: </span>
                    <span className="font-mono text-dark-espresso">
                      {order.paymentMethod || 'Credit Card'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/contact?orderNumber=${encodeURIComponent(
                        order.orderNumber
                      )}&email=${encodeURIComponent(
                        order.customer?.email || customer?.email || ''
                      )}&name=${encodeURIComponent(
                        order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
                          : customer
                            ? `${customer.firstName} ${customer.lastName || ''}`.trim()
                            : ''
                      )}&phone=${encodeURIComponent(
                        order.customer?.phone || customer?.phone || ''
                      )}&subject=${encodeURIComponent('Order Status & Tracking')}`}
                    >
                      <Button variant="ghost" size="sm">
                        Need Assistance?
                      </Button>
                    </Link>
                    {order.items[0]?.slug && (
                      <Link href={`/shop/${order.items[0].slug}`}>
                        <Button variant="secondary" size="sm">
                          Reorder Item
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="container-site section-padding max-w-4xl mx-auto py-24 text-center font-body">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-dark-espresso mb-4" />
          <p className="text-[13px] text-chocolate-brown">Loading your atelier orders...</p>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
