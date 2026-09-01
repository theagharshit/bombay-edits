'use client';

import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    // Simulate API call for now since we don't have a real endpoint yet
    // In production, this would hit the existing newsletter API route
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-[13px] text-espresso border-l-2 border-espresso pl-4 py-2">
        Thank you for subscribing. Welcome to The List.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-sm max-w-[320px]">
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address" 
        required
        disabled={status === 'loading'}
        className="bg-transparent border-b border-beige-line text-[13px] font-body text-espresso focus:outline-none focus:border-espresso pb-2 placeholder:text-muted transition-colors disabled:opacity-50"
      />
      <button 
        type="submit" 
        disabled={status === 'loading'}
        className="self-start border border-espresso text-espresso px-8 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-espresso hover:text-white transition-colors disabled:opacity-50 rounded-none"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'error' && (
        <p className="text-[11px] text-red-800">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
