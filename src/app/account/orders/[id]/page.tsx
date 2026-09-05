'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/frontend/context/AuthContext';
import { OrderService } from '@/frontend/services/orderService';
import { OrderRecord } from '@/backend/models/orderModel';
import { generatePlaceholderImage } from '@/frontend/utils/imageUtils';
import {
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ShoppingBag,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  Receipt,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

function OrderDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading } = useAuth();

  const idOrNumber = (params?.id as string) || '';
  const urlEmail = searchParams.get('email') || '';

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Guest email verification prompt if required
  const [guestVerifyEmail, setGuestVerifyEmail] = useState<string>(urlEmail);
  const [verifyingGuest, setVerifyingGuest] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Accordion / Collapsible Panel States (clean, compact, editorial defaults)
  const [openSections, setOpenSections] = useState<{
    timeline: boolean;
    shipping: boolean;
    payment: boolean;
    summary: boolean;
    care: boolean;
  }>({
    timeline: true,
    shipping: true,
    payment: true,
    summary: true,
    care: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    async function fetchOrder() {
      if (authLoading) return;
      if (!idOrNumber) {
        setError('No order reference specified.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const effectiveEmail = isAuthenticated && customer ? customer.email : urlEmail;
        const res = await OrderService.getOrderById(
          idOrNumber,
          effectiveEmail ? { email: effectiveEmail } : undefined
        );
        setOrder(res);
      } catch (err: unknown) {
        console.error('Failed to load order detail:', err);
        const errMsg = err instanceof Error ? err.message : 'Order not found';
        if (errMsg.includes('Verification email') || errMsg.includes('403')) {
          setVerifyError(
            'Please verify the billing or contact email associated with this consignment.'
          );
        } else {
          setError('Order not found or unavailable. Please check the order reference number.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [idOrNumber, urlEmail, isAuthenticated, customer, authLoading]);

  const handleGuestVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestVerifyEmail.trim()) {
      setVerifyError('Please enter your billing email address.');
      return;
    }

    setVerifyingGuest(true);
    setVerifyError(null);
    try {
      const res = await OrderService.getOrderById(idOrNumber, {
        email: guestVerifyEmail.trim().toLowerCase(),
      });
      setOrder(res);
      router.replace(
        `/account/orders/${encodeURIComponent(idOrNumber)}?email=${encodeURIComponent(
          guestVerifyEmail.trim().toLowerCase()
        )}`
      );
    } catch {
      setVerifyError(
        'Email address does not match this order record. Please re-enter the email used at checkout.'
      );
    } finally {
      setVerifyingGuest(false);
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

  const formatTime = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const STATUS_STEPS = [
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      time: 'Aug 28, 10:30 AM',
      note: 'Catalogued & verified by atelier desk',
    },
    {
      key: 'processing',
      label: 'Handcrafted in Atelier',
      time: 'Aug 29, 02:15 PM',
      note: 'Finishing, pressing & luxury boxed',
    },
    {
      key: 'shipped',
      label: 'Dispatched with Courier',
      time: 'Aug 30, 09:40 AM',
      note: 'Delhivery Air Priority #DEL-884218',
    },
    {
      key: 'delivered',
      label: 'Delivered to Recipient',
      time: 'Est. Sep 02',
      note: 'Signature receipt on delivery',
    },
  ];

  const getStepIndex = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipped') return 2;
    if (s === 'processing') return 1;
    return 0;
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <main className="bg-[var(--color-ivory)] pt-[60px] pb-16 min-h-screen font-body text-[var(--color-ink)]">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4" style={{ zoom: 1.01 }}>
        {/* Editorial Breadcrumbs & Back Navigation */}
        <div className="flex items-center justify-between gap-4 mb-3 text-[11px] text-[var(--color-muted)]">
          <nav className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/account" className="hover:text-[var(--color-ink)] transition-colors">
              Account
            </Link>
            <span>/</span>
            <Link
              href="/account/orders"
              className="hover:text-[var(--color-ink)] transition-colors"
            >
              Order History
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-mono font-medium">{idOrNumber}</span>
          </nav>

          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)] hover:opacity-70 transition-opacity font-medium"
          >
            <ArrowLeft size={11} strokeWidth={2} />
            <span>All Orders</span>
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-16 bg-[#f7f2ea] border border-[var(--color-line)] p-6">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-[var(--color-ink)] mb-3" />
            <p className="text-[12px] text-[var(--color-muted)]">Retrieving order details...</p>
          </div>
        ) : verifyError && !order ? (
          /* Guest Email Verification Screen */
          <div className="bg-[#f7f2ea] border border-[var(--color-line)] p-6 sm:p-8 max-w-md mx-auto text-center font-body">
            <ShieldCheck
              size={32}
              strokeWidth={1.3}
              className="mx-auto text-[var(--color-ink)] mb-2.5"
            />
            <h2
              className="text-xl text-[var(--color-ink)] italic mb-1.5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Verify Consignment
            </h2>
            <p className="text-[11.5px] text-[var(--color-muted)] mb-5 leading-relaxed">
              Enter the email address provided at checkout for <strong>{idOrNumber}</strong> to view
              order details.
            </p>

            <form onSubmit={handleGuestVerify} className="space-y-3 text-left max-w-xs mx-auto">
              <div>
                <label className="block text-[9.5px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-1 font-medium">
                  Billing / Checkout Email
                </label>
                <input
                  type="email"
                  required
                  value={guestVerifyEmail}
                  onChange={(e) => setGuestVerifyEmail(e.target.value)}
                  placeholder="e.g. anya@atelier.com"
                  className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] px-3 py-2 text-[12px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)]"
                />
              </div>

              {verifyError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-900 text-[11px]">
                  {verifyError}
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingGuest}
                className="w-full bg-[var(--color-ink)] text-[var(--color-ivory)] py-2 text-[10.5px] uppercase tracking-[0.16em] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {verifyingGuest ? 'Verifying...' : 'Access Order Details'}
              </button>
            </form>
          </div>
        ) : error || !order ? (
          /* Error State */
          <div className="bg-[#f7f2ea] border border-[var(--color-line)] p-8 text-center max-w-md mx-auto">
            <Package
              size={32}
              strokeWidth={1.3}
              className="mx-auto text-[var(--color-muted)] mb-2.5"
            />
            <h2
              className="text-xl text-[var(--color-ink)] italic mb-1.5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Order Not Found
            </h2>
            <p className="text-[12px] text-[var(--color-muted)] mb-5">
              {error || `Unable to locate order #${idOrNumber}.`}
            </p>
            <Link
              href="/account/orders"
              className="inline-block bg-[var(--color-ink)] text-[var(--color-ivory)] px-5 py-2 text-[10.5px] uppercase tracking-[0.16em] font-medium hover:opacity-90"
            >
              Return to Order History
            </Link>
          </div>
        ) : (
          /* High-End Atelier Order View: Clean, Compact, Collapsible Sections */
          <div className="space-y-3.5">
            {/* ═══ 1. Order Banner & Actions ═══ */}
            <div className="bg-[#f7f2ea] border border-[var(--color-line)] p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--color-ink)] tracking-tight">
                      {order.orderNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] uppercase tracking-wider font-semibold bg-[#eadecd] border border-[var(--color-line)] text-[var(--color-ink)] rounded-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink)]" />
                      {order.status === 'shipped'
                        ? 'Dispatched • In Transit'
                        : order.status === 'delivered'
                          ? 'Delivered'
                          : order.status === 'processing'
                            ? 'In Atelier'
                            : 'Confirmed'}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[var(--color-muted)] mt-0.5">
                    Placed {formatDate(order.createdAt)} at {formatTime(order.createdAt)} •{' '}
                    <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} pieces</span>{' '}
                    •{' '}
                    <strong className="text-[var(--color-ink)] font-medium">
                      Rs. {order.total.toLocaleString('en-IN')}
                    </strong>
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
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
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] text-[10px] uppercase tracking-[0.14em] font-medium transition-colors"
                  >
                    <MessageSquare size={11} strokeWidth={1.5} />
                    <span>Need Assistance?</span>
                  </Link>

                  <a
                    href="https://wa.me/919876543210?text=Hello%20Bombay%20Edits%2C%20I%20have%20an%20inquiry%20regarding%20order%20"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#eadecd] border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[#dfd3c1] text-[10px] uppercase tracking-[0.14em] font-medium transition-colors"
                  >
                    <span>Concierge</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>

            {/* ═══ 2. Collapsible Consignment Journey Accordion ═══ */}
            <div className="bg-[#f7f2ea] border border-[var(--color-line)] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('timeline')}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[#f1ebe1] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-[var(--color-ink)] shrink-0" strokeWidth={1.5} />
                  <span className="text-[10.5px] uppercase tracking-[0.18em] font-medium text-[var(--color-ink)]">
                    Consignment Journey
                  </span>
                  <span className="text-[10px] text-[var(--color-muted)] font-mono">
                    (Delhivery Air Express • #DEL-884218)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[var(--color-muted)]">
                  <span>{openSections.timeline ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      openSections.timeline ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {openSections.timeline && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-[var(--color-line)]/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                    {STATUS_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isCurrent = idx === currentStepIdx;

                      return (
                        <div
                          key={step.key}
                          className={`p-2.5 border transition-all ${
                            isCurrent
                              ? 'bg-[var(--color-ivory)] border-[var(--color-ink)]'
                              : isCompleted
                                ? 'bg-[var(--color-ivory)]/70 border-[var(--color-line)]'
                                : 'bg-transparent border-[var(--color-line)]/40 opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[10.5px] font-medium uppercase tracking-wider ${
                                isCurrent
                                  ? 'text-[var(--color-ink)] font-semibold'
                                  : 'text-[var(--color-muted)]'
                              }`}
                            >
                              {step.label}
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded-xs font-mono ${
                                isCompleted
                                  ? 'bg-[var(--color-ink)] text-[var(--color-ivory)]'
                                  : 'bg-[var(--color-line)] text-[var(--color-muted)]'
                              }`}
                            >
                              {isCompleted ? '✓' : `0${idx + 1}`}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-[var(--color-muted)] leading-snug">
                            {step.note}
                          </p>
                          <span className="text-[9px] font-mono text-[var(--color-muted)] block mt-1">
                            {step.time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ 3. Two-Column Compact Core ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
              {/* Left Column: Acquired Pieces List (7 cols) */}
              <div className="md:col-span-7 space-y-2.5">
                <div className="flex items-center justify-between px-1 pb-1 border-b border-[var(--color-line)]">
                  <h2
                    className="text-base text-[var(--color-ink)] italic"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Acquired Pieces ({order.items.length})
                  </h2>
                  <span className="text-[10.5px] text-[var(--color-muted)]">
                    Direct from Mumbai studio
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => {
                    const itemTotal = item.price * item.quantity;

                    return (
                      <div
                        key={item.productId || `${order.orderNumber}-${idx}`}
                        className="bg-[#f7f2ea] border border-[var(--color-line)] p-3 flex gap-3 hover:border-[var(--color-ink)]/40 transition-colors"
                      >
                        {/* Compact Product Thumbnail */}
                        <div className="relative w-16 h-22 bg-[#ece5d9] shrink-0 border border-[var(--color-line)] overflow-hidden">
                          <Image
                            src={generatePlaceholderImage(240, 320, item.slug || 'product')}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        {/* Product Meta */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/shop/${item.slug}`}
                                className="font-display text-[14px] text-[var(--color-ink)] hover:underline block leading-snug font-medium"
                              >
                                {item.name}
                              </Link>
                              <span className="font-medium text-[12px] text-[var(--color-ink)] shrink-0">
                                Rs. {itemTotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* Attributes Pill Line */}
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[10.5px] text-[var(--color-muted)]">
                              <span>
                                Size:{' '}
                                <strong className="text-[var(--color-ink)]">{item.size}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Colour:{' '}
                                <strong className="text-[var(--color-ink)]">{item.colour}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Qty:{' '}
                                <strong className="text-[var(--color-ink)]">{item.quantity}</strong>
                              </span>
                            </div>

                            <p className="text-[9.5px] text-[var(--color-muted)] font-mono mt-0.5">
                              SKU: {item.productId || `TBE-ITM-${idx + 1}`}
                            </p>
                          </div>

                          {/* Quick Product Actions */}
                          <div className="flex items-center gap-3 pt-2 border-t border-[var(--color-line)]/50 mt-1 text-[10px]">
                            <Link
                              href={`/shop/${item.slug}`}
                              className="inline-flex items-center gap-1 text-[var(--color-ink)] hover:underline font-medium"
                            >
                              <ShoppingBag size={10} />
                              <span>View Piece</span>
                            </Link>

                            <Link
                              href={`/contact?orderNumber=${encodeURIComponent(
                                order.orderNumber
                              )}&email=${encodeURIComponent(
                                order.customer?.email || ''
                              )}&name=${encodeURIComponent(
                                order.customer
                                  ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim()
                                  : ''
                              )}&subject=${encodeURIComponent(`Fitting query: ${item.name}`)}`}
                              className="inline-flex items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                            >
                              <span>Alteration Advice</span>
                              <ChevronRight size={10} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Compact Collapsible Panels (5 cols) */}
              <div className="md:col-span-5 space-y-2.5">
                {/* 1. Collapsible Shipping Destination */}
                <div className="bg-[#f7f2ea] border border-[var(--color-line)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('shipping')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#f1ebe1] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        size={12}
                        className="text-[var(--color-ink)] shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-[10px] uppercase tracking-[0.16em] font-medium text-[var(--color-ink)]">
                        Shipping Destination
                      </span>
                    </div>
                    <ChevronDown
                      size={11}
                      className={`text-[var(--color-muted)] transition-transform duration-200 ${
                        openSections.shipping ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openSections.shipping && (
                    <div className="px-3 pb-3 pt-1 border-t border-[var(--color-line)]/60 text-[11.5px] space-y-0.5 text-[#4A3025] leading-relaxed">
                      <p className="font-semibold text-[12px] text-[var(--color-ink)]">
                        {order.customer?.firstName} {order.customer?.lastName || ''}
                      </p>
                      <p>{order.customer?.address}</p>
                      <p>
                        {order.customer?.city}, {order.customer?.state} {order.customer?.postalCode}
                      </p>
                      <p>{order.customer?.country || 'India'}</p>
                      {order.customer?.phone && (
                        <p className="pt-0.5 text-[10.5px] text-[var(--color-muted)]">
                          Contact: {order.customer.phone}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Collapsible Payment & Carrier */}
                <div className="bg-[#f7f2ea] border border-[var(--color-line)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('payment')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#f1ebe1] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <CreditCard
                        size={12}
                        className="text-[var(--color-ink)] shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-[10px] uppercase tracking-[0.16em] font-medium text-[var(--color-ink)]">
                        Payment & Logistics
                      </span>
                    </div>
                    <ChevronDown
                      size={11}
                      className={`text-[var(--color-muted)] transition-transform duration-200 ${
                        openSections.payment ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openSections.payment && (
                    <div className="px-3 pb-3 pt-1 border-t border-[var(--color-line)]/60 text-[11px] space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-muted)]">Payment Mode</span>
                        <span className="font-medium text-[var(--color-ink)] capitalize">
                          {order.paymentMethod || 'UPI / Prepaid'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-muted)]">Carrier Service</span>
                        <span className="font-mono text-[10.5px] text-[var(--color-ink)]">
                          Delhivery Air Priority
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--color-muted)]">Packaging</span>
                        <span className="text-[var(--color-ink)]">Signature Atelier Box</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Collapsible Financial Breakdown */}
                <div className="bg-[#f7f2ea] border border-[var(--color-line)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('summary')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#f1ebe1] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <Receipt
                        size={12}
                        className="text-[var(--color-ink)] shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-[10px] uppercase tracking-[0.16em] font-medium text-[var(--color-ink)]">
                        Financial Breakdown
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-semibold text-[var(--color-ink)]">
                        Rs. {order.total.toLocaleString('en-IN')}
                      </span>
                      <ChevronDown
                        size={11}
                        className={`text-[var(--color-muted)] transition-transform duration-200 ${
                          openSections.summary ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {openSections.summary && (
                    <div className="px-3 pb-3 pt-1 border-t border-[var(--color-line)]/60 text-[11px] space-y-1.5">
                      <div className="flex justify-between text-[var(--color-muted)]">
                        <span>Subtotal</span>
                        <span>Rs. {order.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[var(--color-muted)]">
                        <span>Artisanal Shipping</span>
                        <span>
                          {order.shippingCost === 0
                            ? 'Complimentary'
                            : `Rs. ${order.shippingCost.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <div className="border-t border-[var(--color-line)]/60 pt-1.5 flex justify-between items-center font-medium text-[12.5px] text-[var(--color-ink)]">
                        <span>Total Paid</span>
                        <span className="font-bold">Rs. {order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Collapsible Care & Studio Fitting */}
                <div className="bg-[#f7f2ea] border border-[var(--color-line)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('care')}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#f1ebe1] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles
                        size={12}
                        className="text-[var(--color-ink)] shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-[10px] uppercase tracking-[0.16em] font-medium text-[var(--color-ink)]">
                        Care & Complimentary Fitting
                      </span>
                    </div>
                    <ChevronDown
                      size={11}
                      className={`text-[var(--color-muted)] transition-transform duration-200 ${
                        openSections.care ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openSections.care && (
                    <div className="px-3 pb-3 pt-1 border-t border-[var(--color-line)]/60 text-[10.5px] text-[var(--color-muted)] leading-relaxed space-y-1">
                      <p>Every piece is crafted in pure silks and handlooms. Dry clean only.</p>
                      <p>
                        Should you require alteration or waist/hem refinement, our Mumbai studio
                        offers complimentary fittings within 30 days of receipt.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[var(--color-ivory)] pt-[60px] min-h-screen flex items-center justify-center font-body text-[12.5px] text-[var(--color-muted)]">
          Loading atelier order...
        </div>
      }
    >
      <OrderDetailContent />
    </Suspense>
  );
}
