'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, CheckCircle2, ArrowUpRight, Send } from 'lucide-react';
import { Container } from '@/frontend/components/layout/Container';
import { useContact } from '@/frontend/hooks/useContact';

const TOPIC_OPTIONS = [
  'General Inquiry',
  'Custom Sizing & Bespoke',
  'Order Status & Tracking',
  'Bridal & Occasionwear',
  'Exchanges & Returns',
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: TOPIC_OPTIONS[0],
    message: '',
  });

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
  };

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] pt-[84px] md:pt-[96px] pb-12 md:pb-16 border-t border-[var(--color-line)]">
      <Container>
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-[11px] font-body text-[var(--color-muted)]">
            <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[var(--color-ink)] font-medium">Contact</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-[10.5px] uppercase tracking-[0.24em] text-[var(--color-muted)] font-body block mb-1.5 font-medium">
              The Atelier Concierge
            </span>
            <h1
              className="text-2xl md:text-4xl text-[var(--color-ink)] italic mb-2 font-normal"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Get in Touch
            </h1>
            <p className="font-body text-[13px] text-[var(--color-muted)] max-w-md mx-auto leading-relaxed">
              We are at your service for bespoke sizing, order inquiries, or personal styling.
            </p>
          </div>

          {/* Compact Quick Contact Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border border-[var(--color-line)] bg-[#f7f2ea] divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-line)] mb-6 font-body text-[12px]">
            <a
              href="https://wa.me/919876543210?text=Hello%20Bombay%20Edits%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 flex items-center justify-between hover:bg-[var(--color-sand)] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare
                  size={15}
                  className="text-[var(--color-ink)] shrink-0"
                  strokeWidth={1.5}
                />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] block">
                    WhatsApp
                  </span>
                  <span className="font-medium text-[var(--color-ink)]">Chat Direct</span>
                </div>
              </div>
              <ArrowUpRight
                size={13}
                className="text-[var(--color-muted)] group-hover:text-[var(--color-ink)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </a>

            <a
              href="mailto:support@bombayedits.com"
              className="p-3.5 flex items-center justify-between hover:bg-[var(--color-sand)] transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[var(--color-ink)] shrink-0" strokeWidth={1.5} />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] block">
                    Email
                  </span>
                  <span className="font-medium text-[var(--color-ink)]">
                    support@bombayedits.com
                  </span>
                </div>
              </div>
              <ArrowUpRight
                size={13}
                className="text-[var(--color-muted)] group-hover:text-[var(--color-ink)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
              />
            </a>

            <div className="p-3.5 flex items-center gap-2.5">
              <Clock size={15} className="text-[var(--color-ink)] shrink-0" strokeWidth={1.5} />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] block">
                  Studio Desk
                </span>
                <span className="font-medium text-[var(--color-ink)]">Mon–Sat 10:30–20:30</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-[#f3ede4] border border-[var(--color-line)] p-5 md:p-7 shadow-xs">
            {isSuccess ? (
              <div
                data-testid="contact-success-state"
                className="py-6 flex flex-col items-center text-center font-body"
              >
                <div className="w-10 h-10 rounded-full border border-[var(--color-ink)] flex items-center justify-center text-[var(--color-ink)] mb-3 bg-[var(--color-ivory)]">
                  <CheckCircle2 size={20} strokeWidth={1.5} />
                </div>

                <h3
                  className="text-xl text-[var(--color-ink)] italic mb-1.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Inquiry Transmitted
                </h3>

                <p className="text-[12px] text-[var(--color-muted)] max-w-sm mb-5 leading-relaxed">
                  Thank you. Your request has been catalogued in our atelier database and an advisor
                  will reply within 24 hours.
                </p>

                {/* Squeezed Reference Ticket */}
                <div className="w-full max-w-sm bg-[var(--color-ivory)] border border-[var(--color-line)] p-3 mb-5 text-[11px] space-y-1.5 text-left">
                  <div className="flex justify-between items-center border-b border-[var(--color-line)] pb-1.5">
                    <span className="text-[var(--color-muted)] uppercase tracking-wider">
                      Ticket ID
                    </span>
                    <span className="font-mono font-medium text-[var(--color-ink)]">
                      {data?.submissionId || 'Recorded'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-muted)] uppercase tracking-wider">
                      Status
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] uppercase tracking-wider font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {data?.status || 'new'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] px-5 py-2 text-[10.5px] uppercase tracking-[0.16em] transition-colors cursor-pointer font-medium"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3.5 font-body text-[13px]"
                data-testid="contact-form"
              >
                {/* Topic Select */}
                <div>
                  <label
                    htmlFor="contact_subject"
                    className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-1 font-medium"
                  >
                    Inquiry Topic
                  </label>
                  <select
                    id="contact_subject"
                    value={form.subject}
                    onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[12.5px] text-[var(--color-ink)] px-3 py-2 focus:outline-none transition-colors cursor-pointer"
                  >
                    {TOPIC_OPTIONS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="contact_name"
                      className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-1 font-medium"
                    >
                      Name <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="contact_name"
                      type="text"
                      required
                      disabled={isLoading}
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[12.5px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-3 py-2 focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact_email"
                      className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-1 font-medium"
                    >
                      Email <span className="text-red-700">*</span>
                    </label>
                    <input
                      id="contact_email"
                      type="email"
                      required
                      disabled={isLoading}
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[12.5px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-3 py-2 focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Optional Phone & Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="contact_phone"
                      className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-1 font-medium"
                    >
                      Mobile / WhatsApp{' '}
                      <span className="text-[var(--color-muted)] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact_phone"
                      type="tel"
                      disabled={isLoading}
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[12.5px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-3 py-2 focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact_orderNumber"
                      className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-1 font-medium"
                    >
                      Order Number{' '}
                      <span className="text-[var(--color-muted)] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact_orderNumber"
                      type="text"
                      disabled={isLoading}
                      value={form.orderNumber}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, orderNumber: e.target.value }))
                      }
                      placeholder="TBE-2026-XXXXX"
                      className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[12.5px] font-mono text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-3 py-2 focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact_message"
                    className="block text-[10px] uppercase tracking-[0.16em] text-[var(--color-ink)] mb-1 font-medium"
                  >
                    Message <span className="text-red-700">*</span>
                  </label>
                  <textarea
                    id="contact_message"
                    required
                    rows={3}
                    disabled={isLoading}
                    value={form.message}
                    onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your inquiry, sizing requirement, or order query..."
                    className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] focus:border-[var(--color-ink)] text-[12.5px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/50 px-3 py-2 focus:outline-none transition-colors disabled:opacity-50 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-[11px]">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    isLoading || !form.name.trim() || !form.email.trim() || !form.message.trim()
                  }
                  className="w-full bg-[var(--color-ink)] text-[var(--color-ivory)] hover:bg-[#3d2f28] py-2.5 text-[10.5px] uppercase tracking-[0.18em] font-medium transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-1"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={12} />
                    </>
                  )}
                </button>

                <p className="text-center font-body text-[10px] text-[var(--color-muted)] pt-0.5">
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
      </Container>
    </main>
  );
}
