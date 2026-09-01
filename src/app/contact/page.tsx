'use client';

import { useState } from 'react';
import { Metadata } from 'next';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setForm({ name: '', email: '', subject: '', message: '' });
    } catch { setStatus('error'); }
  };

  return (
    <div className="container-site section-padding max-w-2xl mx-auto">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">Get in touch</h1>
      <p className="text-sm text-text-muted mb-10">We would love to hear from you. For custom stitching enquiries, order questions, or simply to say hello.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          {status === 'success' ? (
            <div className="bg-cream p-8 rounded-sm text-center">
              <p className="font-display text-xl text-ink mb-2">Message sent</p>
              <p className="text-sm text-text-muted">We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-body text-text-muted block mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="w-full border-b border-border bg-transparent py-2.5 text-sm font-body text-ink focus:outline-none focus:border-ink" />
              </div>
              <div>
                <label className="text-xs font-body text-text-muted block mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="w-full border-b border-border bg-transparent py-2.5 text-sm font-body text-ink focus:outline-none focus:border-ink" />
              </div>
              <div>
                <label className="text-xs font-body text-text-muted block mb-1">Subject</label>
                <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full border-b border-border bg-transparent py-2.5 text-sm font-body text-ink focus:outline-none focus:border-ink" />
              </div>
              <div>
                <label className="text-xs font-body text-text-muted block mb-1">Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required rows={5} className="w-full border border-border bg-transparent py-2.5 px-3 text-sm font-body text-ink focus:outline-none focus:border-ink rounded-sm resize-none" />
              </div>
              <button type="submit" disabled={status === 'loading'} className="bg-ink text-ivory px-8 py-3 text-sm font-body rounded-sm hover:bg-deep-brown transition-colors disabled:opacity-50" style={{ transitionDuration: 'var(--duration-fast)' }}>
                {status === 'loading' ? 'Sending...' : 'Send message'}
              </button>
              {status === 'error' && <p className="text-xs text-wine">Something went wrong. Please try again.</p>}
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">Email</h3>
            <a href="mailto:hello@thebombayedit.com" className="text-sm text-ink hover:text-deep-brown">hello@thebombayedit.com</a>
          </div>
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">WhatsApp</h3>
            <a href="https://wa.me/91" target="_blank" rel="noopener noreferrer" className="text-sm text-ink hover:text-deep-brown">+91 XXX-XXX-XXXX</a>
          </div>
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">Instagram</h3>
            <a href="https://instagram.com/thebombayedit" target="_blank" rel="noopener noreferrer" className="text-sm text-ink hover:text-deep-brown">@thebombayedit</a>
          </div>
          <div>
            <h3 className="text-xs font-body text-text-muted uppercase tracking-wide mb-2">Based in</h3>
            <p className="text-sm text-deep-brown">Mumbai, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
