'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Send,
  MapPin,
  Package,
  X,
} from 'lucide-react';
import { useContact } from '@/frontend/hooks/useContact';
import { useAuth } from '@/frontend/context/AuthContext';

const TOPIC_OPTIONS = [
  'General Inquiry',
  'Custom Sizing & Bespoke',
  'Order Status & Tracking',
  'Bridal & Occasionwear',
  'Exchanges & Returns',
];

function ContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer } = useAuth();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const urlOrder = searchParams.get('orderNumber') || '';
  const urlEmail = searchParams.get('email') || '';
  const urlName = searchParams.get('name') || '';
  const urlPhone = searchParams.get('phone') || '';
  const urlSubject = searchParams.get('subject') || '';

  const [isPrefilled, setIsPrefilled] = useState<boolean>(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: TOPIC_OPTIONS[0],
    message: '',
  });

  // Prepopulate form fields from URL params (Need Assistance flow) or customer profile
  useEffect(() => {
    const customerFullName = customer
      ? `${customer.firstName} ${customer.lastName || ''}`.trim()
      : '';
    const resolvedName = urlName || customerFullName;
    const resolvedEmail = urlEmail || customer?.email || '';
    const resolvedPhone = urlPhone || customer?.phone || '';
    const resolvedOrder = urlOrder || '';
    const resolvedSubject = urlSubject || (urlOrder ? 'Order Status & Tracking' : TOPIC_OPTIONS[0]);

    if (urlOrder) {
      setIsPrefilled(true);
    }

    setForm((prev) => ({
      ...prev,
      name: resolvedName || prev.name,
      email: resolvedEmail || prev.email,
      phone: resolvedPhone || prev.phone,
      orderNumber: resolvedOrder || prev.orderNumber,
      subject: resolvedSubject || prev.subject,
    }));

    // If order reference provided, auto-focus message box so user only has to write their message
    if (urlOrder) {
      const timer = setTimeout(() => {
        messageInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [urlOrder, urlEmail, urlName, urlPhone, urlSubject, customer]);

  const handleClearAll = () => {
    setIsPrefilled(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      orderNumber: '',
      subject: TOPIC_OPTIONS[0],
      message: '',
    });
    router.replace('/contact');
  };

  const { isLoading, isSuccess, error, data, submitContact, reset } = useContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContact({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      orderNumber: form.orderNumber.trim() || undefined,
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
  };

  const handleReset = () => {
    reset();
    setForm({
      name: '',
      email: '',
      phone: '',
      orderNumber: '',
      subject: TOPIC_OPTIONS[0],
      message: '',
    });
    setIsPrefilled(false);
    router.replace('/contact');
  };

  return (
    <main className="bg-[var(--color-ivory)] pt-[60px] flex flex-col justify-start">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4" style={{ zoom: 1.01 }}>
        {/* Breadcrumb Navigation */}
        <nav className="mb-2.5 flex items-center gap-2 text-[11px] font-body text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink)] font-medium">Contact</span>
        </nav>

        {/* Page Heading */}
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)] font-body block font-medium">
            The Atelier Concierge
          </span>
          <h1
            className="text-2xl md:text-3xl text-[var(--color-ink)] italic font-normal"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Get in Touch
          </h1>
          <p className="font-body text-[12.5px] text-[var(--color-muted)]">
            We are at your service for bespoke sizing, order inquiries, or personal styling.
          </p>
        </div>

        {/* 2-Column Compact Layout: Direct Concierge & Form (Same Level / Height) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* Left Column: Direct Concierge Channels (4 cols) - Equal Height */}
          <div className="md:col-span-4 flex flex-col gap-2.5 font-body text-[12px] h-full">
            {/* WhatsApp Quick Card */}
            <a
              href="https://wa.me/919876543210?text=Hello%20Bombay%20Edits%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 p-3.5 bg-[#f0e9df] border border-[var(--color-line)] hover:border-[var(--color-ink)]/40 transition-colors group cursor-pointer flex flex-col justify-center"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare
                    size={15}
                    className="text-[var(--color-ink)] shrink-0"
                    strokeWidth={1.5}
                  />
                  <span className="font-medium text-[12px] text-[var(--color-ink)]">
                    WhatsApp Concierge
                  </span>
                </div>
                <ArrowUpRight
                  size={13}
                  className="text-[var(--color-muted)] group-hover:text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <p className="text-[11px] text-[var(--color-muted)] leading-tight">
                Instant styling advice, fabric swatches & custom fits.
              </p>
            </a>

            {/* Email Channel with Top-Right Arrow */}
            <a
              href="mailto:support@bombayedits.com"
              className="flex-1 p-3.5 bg-[#f7f2ea] border border-[var(--color-line)] hover:border-[var(--color-ink)]/40 transition-colors group cursor-pointer flex flex-col justify-center"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[var(--color-ink)] shrink-0" strokeWidth={1.5} />
                  <span className="font-medium text-[12px] text-[var(--color-ink)]">
                    Electronic Mail
                  </span>
                </div>
                <ArrowUpRight
                  size={13}
                  className="text-[var(--color-muted)] group-hover:text-[var(--color-ink)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <span className="text-[12px] font-medium text-[var(--color-ink)] block leading-tight">
                support@bombayedits.com
              </span>
              <span className="text-[10.5px] text-[var(--color-muted)] block mt-0.5 leading-tight">
                Replies within 24 business hours
              </span>
            </a>

            {/* Studio Hours */}
            <div className="flex-1 p-3.5 bg-[#f7f2ea] border border-[var(--color-line)] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-[var(--color-ink)] shrink-0" strokeWidth={1.5} />
                <span className="text-[10.5px] uppercase tracking-wider text-[var(--color-muted)] font-medium">
                  Concierge Desk
                </span>
              </div>
              <a
                href="tel:+919876543210"
                className="text-[12px] font-medium text-[var(--color-ink)] hover:underline block leading-tight"
              >
                +91 9876543210
              </a>
              <span className="text-[10.5px] text-[var(--color-muted)] block mt-0.5 leading-tight">
                Mon to Sat: 10:30 AM – 8:30 PM IST
              </span>
            </div>

            {/* Atelier Studio Address */}
            <div className="flex-1 p-3.5 bg-[#f7f2ea] border border-[var(--color-line)] flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-[var(--color-ink)] shrink-0" strokeWidth={1.5} />
                <span className="text-[10.5px] uppercase tracking-wider text-[var(--color-muted)] font-medium">
                  Atelier
                </span>
              </div>
              <span className="text-[11.5px] text-[var(--color-ink)] block leading-tight">
                Bombay Edits Pvt Ltd, Mumbai 400001
              </span>
            </div>
          </div>

          {/* Right Column: Squeezed Form Card (8 cols) - Equal Height */}
          <div className="md:col-span-8 bg-[#f3ede4] border border-[var(--color-line)] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            {isSuccess ? (
              <div
                data-testid="contact-success-state"
                className="py-4 flex flex-col items-center text-center font-body"
              >
                <div className="w-9 h-9 rounded-none border border-[var(--color-ink)] flex items-center justify-center text-[var(--color-ink)] mb-2.5 bg-[var(--color-ivory)]">
                  <CheckCircle2 size={18} strokeWidth={1.5} />
                </div>

                <h3
                  className="text-lg text-[var(--color-ink)] italic mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Inquiry Transmitted
                </h3>

                <p className="text-[11.5px] text-[var(--color-muted)] max-w-sm mb-3.5 leading-relaxed">
                  Thank you. Your request has been catalogued in our atelier database and an advisor
                  will reply within 24 hours.
                </p>

                {/* Squeezed Reference Ticket */}
                <div className="w-full max-w-xs bg-[var(--color-ivory)] border border-[var(--color-line)] p-2.5 mb-3.5 text-[10.5px] text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-muted)] uppercase tracking-wider">
                      Ticket ID
                    </span>
                    <span className="font-mono font-medium text-[var(--color-ink)]">
                      {data?.submissionId || 'Recorded'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors cursor-pointer font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2.5 font-body text-[12.5px]"
                data-testid="contact-form"
              >
                {/* Prefilled Banner with Clear All Button */}
                {isPrefilled && form.orderNumber && (
                  <div className="flex items-center justify-between px-3 py-2 bg-[#eadecd]/80 border border-[var(--color-line)] text-[11px] text-[var(--color-ink)] rounded-none">
                    <div className="flex items-center gap-1.5">
                      <Package size={13} className="text-[var(--color-ink)] shrink-0" />
                      <span>
                        Order Reference:{' '}
                        <strong className="font-mono font-semibold">{form.orderNumber}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--color-ink)] hover:underline font-semibold cursor-pointer ml-2"
                      title="Clear prefilled details"
                    >
                      <X size={11} strokeWidth={2} />
                      <span>Clear all</span>
                    </button>
                  </div>
                )}

                {/* Topic Select */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label
                      htmlFor="contact_subject"
                      className="block text-[9.5px] uppercase tracking-[0.16em] text-[var(--color-ink)] font-medium"
                    >
                      Inquiry Topic
                    </label>
                  </div>
                  <select
                    id="contact_subject"
                    disabled={isPrefilled}
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className={`w-full border border-[var(--color-line)] text-[12px] text-[var(--color-ink)] px-2.5 py-1.5 focus:outline-none transition-all ${
                      isPrefilled
                        ? 'bg-[#eadecd]/40 opacity-70 blur-[0.3px] cursor-not-allowed select-none'
                        : 'bg-[var(--color-ivory)] focus:border-[var(--color-ink)] cursor-pointer'
                    }`}
                  >
                    {TOPIC_OPTIONS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name & Email (2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label
                        htmlFor="contact_name"
                        className="block text-[9.5px] uppercase tracking-[0.16em] text-[var(--color-ink)] font-medium"
                      >
                        Name <span className="text-red-700">*</span>
                      </label>
                    </div>
                    <input
                      id="contact_name"
                      type="text"
                      required
                      readOnly={isPrefilled}
                      disabled={isLoading}
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className={`w-full border border-[var(--color-line)] text-[12px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-2.5 py-1.5 focus:outline-none transition-all disabled:opacity-50 ${
                        isPrefilled
                          ? 'bg-[#eadecd]/40 opacity-70 blur-[0.3px] cursor-not-allowed select-none'
                          : 'bg-[var(--color-ivory)] focus:border-[var(--color-ink)]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label
                        htmlFor="contact_email"
                        className="block text-[9.5px] uppercase tracking-[0.16em] text-[var(--color-ink)] font-medium"
                      >
                        Email <span className="text-red-700">*</span>
                      </label>
                    </div>
                    <input
                      id="contact_email"
                      type="email"
                      required
                      readOnly={isPrefilled}
                      disabled={isLoading}
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className={`w-full border border-[var(--color-line)] text-[12px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-2.5 py-1.5 focus:outline-none transition-all disabled:opacity-50 ${
                        isPrefilled
                          ? 'bg-[#eadecd]/40 opacity-70 blur-[0.3px] cursor-not-allowed select-none'
                          : 'bg-[var(--color-ivory)] focus:border-[var(--color-ink)]'
                      }`}
                    />
                  </div>
                </div>

                {/* Mobile & Order Number (2 cols) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label
                        htmlFor="contact_phone"
                        className="block text-[9.5px] uppercase tracking-[0.16em] text-[var(--color-ink)] font-medium"
                      >
                        WhatsApp / Mobile{' '}
                        <span className="text-[var(--color-muted)] font-normal">(Optional)</span>
                      </label>
                    </div>
                    <input
                      id="contact_phone"
                      type="tel"
                      readOnly={isPrefilled}
                      disabled={isLoading}
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className={`w-full border border-[var(--color-line)] text-[12px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-2.5 py-1.5 focus:outline-none transition-all disabled:opacity-50 ${
                        isPrefilled
                          ? 'bg-[#eadecd]/40 opacity-70 blur-[0.3px] cursor-not-allowed select-none'
                          : 'bg-[var(--color-ivory)] focus:border-[var(--color-ink)]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label
                        htmlFor="contact_orderNumber"
                        className="block text-[9.5px] uppercase tracking-[0.16em] text-[var(--color-ink)] font-medium"
                      >
                        Order Number{' '}
                        <span className="text-[var(--color-muted)] font-normal">(Optional)</span>
                      </label>
                    </div>
                    <input
                      id="contact_orderNumber"
                      type="text"
                      readOnly={isPrefilled}
                      disabled={isLoading}
                      value={form.orderNumber}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, orderNumber: e.target.value }))
                      }
                      placeholder="e.g. TBE-2026-XXXXX"
                      className={`w-full border border-[var(--color-line)] text-[12px] font-mono text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-2.5 py-1.5 focus:outline-none transition-all disabled:opacity-50 ${
                        isPrefilled
                          ? 'bg-[#eadecd]/40 opacity-70 blur-[0.3px] cursor-not-allowed select-none font-semibold'
                          : 'bg-[var(--color-ivory)] focus:border-[var(--color-ink)]'
                      }`}
                    />
                  </div>
                </div>

                {/* Message Field (Always editable, focused automatically when prefilled) */}
                <div>
                  <label
                    htmlFor="contact_message"
                    className="block text-[9.5px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-0.5 font-medium"
                  >
                    Message <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    ref={messageInputRef}
                    id="contact_message"
                    required
                    rows={2}
                    disabled={isLoading}
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder={
                      isPrefilled && form.orderNumber
                        ? `Please describe your query regarding order #${form.orderNumber}...`
                        : 'Describe your inquiry, sizing requirement, or order query...'
                    }
                    className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[12px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-2.5 py-1.5 focus:outline-none transition-colors disabled:opacity-50 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-800 text-[10.5px]">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    isLoading || !form.name.trim() || !form.email.trim() || !form.message.trim()
                  }
                  className="w-full bg-[var(--color-ink)] text-[var(--color-ivory)] hover:bg-[#3d2f28] py-2 text-[10px] uppercase tracking-[0.18em] font-medium transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 mt-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={11} />
                    </>
                  )}
                </button>

                <p className="text-center font-body text-[9.5px] text-[var(--color-muted)]">
                  Your information is protected under our{' '}
                  <Link
                    href="/policies/privacy"
                    className="underline hover:text-[var(--color-ink)]"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] bg-[var(--color-ivory)] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
