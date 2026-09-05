'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useContact } from '@/frontend/hooks/useContact';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const { isLoading, isSuccess, error, submitContact } = useContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitContact(form);
    if (success) {
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="w-full bg-[var(--color-ivory)] pb-24">
      {/* Cinematic Hero Banner */}
      <section className="relative w-full h-[60vh] min-h-[440px] flex items-center justify-center overflow-hidden bg-black mb-16">
        <Image
          src="https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=2400&h=1400&q=85"
          alt="Contact Us – Private Atelier and Custom Stitching"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(30,22,18,0.85) 0%, rgba(30,22,18,0.4) 50%, rgba(30,22,18,0.2) 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[800px] mt-12">
          <span className="text-[11px] uppercase tracking-[0.24em] font-medium text-white/70 mb-3 font-body">
            Bespoke & Atelier
          </span>
          <h1 className="font-display text-[44px] md:text-[68px] text-white leading-none whitespace-nowrap mb-6 drop-shadow-sm">
            Get in Touch
          </h1>
          <p className="text-[15px] md:text-[17px] text-white/90 leading-[1.7] max-w-[620px] font-body">
            We would love to hear from you. For custom stitching enquiries, private styling
            appointments, or bespoke couture commissions.
          </p>
        </div>
      </section>

      <div className="container-site max-w-3xl mx-auto px-6">
        <div>
          {isSuccess ? (
            <div className="bg-cream p-8 rounded-none border border-beige-line text-center">
              <p className="font-display text-xl text-dark-espresso mb-2">Message sent</p>
              <p className="text-sm text-chocolate-brown">
                We will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-body text-chocolate-brown block mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full border-b border-beige-line bg-transparent py-2.5 text-sm font-body text-dark-espresso focus:outline-none focus:border-dark-espresso"
                />
              </div>
              <div>
                <label className="text-xs font-body text-chocolate-brown block mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                  className="w-full border-b border-beige-line bg-transparent py-2.5 text-sm font-body text-dark-espresso focus:outline-none focus:border-dark-espresso"
                />
              </div>
              <div>
                <label className="text-xs font-body text-chocolate-brown block mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full border-b border-beige-line bg-transparent py-2.5 text-sm font-body text-dark-espresso focus:outline-none focus:border-dark-espresso"
                />
              </div>
              <div>
                <label className="text-xs font-body text-chocolate-brown block mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  required
                  rows={5}
                  className="w-full border border-beige-line bg-transparent py-2.5 px-3 text-sm font-body text-dark-espresso focus:outline-none focus:border-dark-espresso rounded-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-dark-espresso text-cream px-8 py-3 text-[11px] uppercase tracking-[0.18em] rounded-none hover:bg-chocolate-brown transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Sending...' : 'Send message'}
              </button>
              {error && <p className="text-xs text-red-700">{error}</p>}
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">
              Email
            </h3>
            <a
              href="mailto:hello@thebombayedit.com"
              className="text-sm text-ink hover:text-deep-brown"
            >
              hello@thebombayedit.com
            </a>
          </div>
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">
              WhatsApp
            </h3>
            <a
              href="https://wa.me/91"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink hover:text-deep-brown"
            >
              +91 XXX-XXX-XXXX
            </a>
          </div>
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">
              Instagram
            </h3>
            <a
              href="https://instagram.com/thebombayedit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink hover:text-deep-brown"
            >
              @thebombayedit
            </a>
          </div>
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">
              Based in
            </h3>
            <p className="text-sm text-deep-brown">Mumbai, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
