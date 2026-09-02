'use client';

import { useState } from 'react';
import { useNewsletter } from '@/frontend/hooks/useNewsletter';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const { isLoading, isSuccess, message, error, subscribe } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const success = await subscribe(email.trim());
    if (success) {
      setEmail('');
    }
  };

  if (isSuccess) {
    return (
      <div className="text-[13px] text-dark-espresso border-l-2 border-champagne-gold pl-4 py-2 bg-cream/50">
        {message || 'Thank you for subscribing. Welcome to The List.'}
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
        disabled={isLoading}
        className="bg-transparent border-b border-beige-line text-[13px] font-body text-dark-espresso focus:outline-none focus:border-dark-espresso pb-2 placeholder:text-muted-taupe transition-colors disabled:opacity-50"
      />
      <button 
        type="submit" 
        disabled={isLoading}
        className="self-start border border-dark-espresso text-dark-espresso px-8 py-3 text-[11px] uppercase tracking-[0.18em] hover:bg-dark-espresso hover:text-cream transition-colors disabled:opacity-50 rounded-none cursor-pointer"
      >
        {isLoading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && (
        <p className="text-[11px] text-red-800">{error}</p>
      )}
    </form>
  );
}
