'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';

export function AtelierAuthGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'guest-lookup'>(() => {
    if (tabParam === 'guest-lookup') return 'guest-lookup';
    if (tabParam === 'register') return 'register';
    return 'signin';
  });

  useEffect(() => {
    if (tabParam === 'guest-lookup' || tabParam === 'register' || tabParam === 'signin') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register state
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Guest Order Lookup state
  const [lookupForm, setLookupForm] = useState({ orderNumber: '', email: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = loginForm.email.trim();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!loginForm.password) {
      setError('Please enter your password');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email, password: loginForm.password });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = regForm.email.trim();
    if (!regForm.firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!regForm.password || regForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await register({ ...regForm, email });
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = lookupForm.email.trim();
    if (!lookupForm.orderNumber.trim()) {
      setError('Please enter your order number');
      return;
    }
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    router.push(
      `/account/orders?orderNumber=${encodeURIComponent(
        lookupForm.orderNumber.trim()
      )}&email=${encodeURIComponent(email.toLowerCase())}`
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto py-8 sm:py-14 px-4 font-body">
      {/* Tabs */}
      <div className="flex border-b border-[#EAE3DA] mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('signin');
            setError(null);
          }}
          className={`flex-1 pb-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer text-center -mb-px ${
            activeTab === 'signin'
              ? 'border-b border-[#4A3025] text-[#4A3025] font-semibold'
              : 'border-b border-transparent text-[#8A817C] hover:text-[#4A3025]'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('register');
            setError(null);
          }}
          className={`flex-1 pb-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer text-center -mb-px ${
            activeTab === 'register'
              ? 'border-b border-[#4A3025] text-[#4A3025] font-semibold'
              : 'border-b border-transparent text-[#8A817C] hover:text-[#4A3025]'
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('guest-lookup');
            setError(null);
          }}
          className={`flex-1 pb-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer text-center -mb-px ${
            activeTab === 'guest-lookup'
              ? 'border-b border-[#4A3025] text-[#4A3025] font-semibold'
              : 'border-b border-transparent text-[#8A817C] hover:text-[#4A3025]'
          }`}
        >
          Guest Lookup
        </button>
      </div>

      {/* Sign In Form */}
      {activeTab === 'signin' && (
        <form noValidate onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              aria-label="Email Address"
              value={loginForm.email}
              aria-invalid={error ? 'true' : undefined}
              onChange={(e) => {
                setLoginForm({ ...loginForm, email: e.target.value });
                if (error) setError(null);
              }}
              className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
              placeholder="Email Address"
            />
          </div>

          <div>
            <input
              type="password"
              aria-label="Password"
              value={loginForm.password}
              onChange={(e) => {
                setLoginForm({ ...loginForm, password: e.target.value });
                if (error) setError(null);
              }}
              className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="text-[11px] text-[var(--color-wine)] tracking-wide font-body text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 sm:py-3 bg-[#4A3025] text-[#FAF6F0] text-[10px] uppercase tracking-[0.22em] font-medium hover:bg-[#34221A] disabled:opacity-50 transition-colors cursor-pointer rounded-none mt-2"
          >
            {submitting ? 'Entering Atelier...' : 'Sign In'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form noValidate onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                aria-label="First Name"
                value={regForm.firstName}
                onChange={(e) => {
                  setRegForm({ ...regForm, firstName: e.target.value });
                  if (error) setError(null);
                }}
                className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
                placeholder="First Name"
              />
            </div>
            <div>
              <input
                type="text"
                aria-label="Last Name"
                value={regForm.lastName}
                onChange={(e) => {
                  setRegForm({ ...regForm, lastName: e.target.value });
                  if (error) setError(null);
                }}
                className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <input
              type="email"
              aria-label="Email Address"
              value={regForm.email}
              aria-invalid={error ? 'true' : undefined}
              onChange={(e) => {
                setRegForm({ ...regForm, email: e.target.value });
                if (error) setError(null);
              }}
              className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
              placeholder="Email Address"
            />
          </div>

          <div>
            <input
              type="tel"
              aria-label="Phone Number (Optional)"
              value={regForm.phone}
              onChange={(e) => {
                setRegForm({ ...regForm, phone: e.target.value });
                if (error) setError(null);
              }}
              className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
              placeholder="Phone Number (Optional)"
            />
          </div>

          <div>
            <input
              type="password"
              aria-label="Password (min 6 characters)"
              value={regForm.password}
              onChange={(e) => {
                setRegForm({ ...regForm, password: e.target.value });
                if (error) setError(null);
              }}
              className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
              placeholder="Password (min 6 characters)"
            />
          </div>

          {error && (
            <p className="text-[11px] text-[var(--color-wine)] tracking-wide font-body text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 sm:py-3 bg-[#4A3025] text-[#FAF6F0] text-[10px] uppercase tracking-[0.22em] font-medium hover:bg-[#34221A] disabled:opacity-50 transition-colors cursor-pointer rounded-none mt-2"
          >
            {submitting ? 'Creating Membership...' : 'Create Atelier Account'}
          </button>
        </form>
      )}

      {/* Guest Order Lookup */}
      {activeTab === 'guest-lookup' && (
        <form noValidate onSubmit={handleLookup} className="space-y-4">
          <p className="text-[12px] text-[#8A817C] leading-relaxed mb-3">
            Placed an order as a guest? Enter your consignment order number to review dispatch
            status and details.
          </p>

          <div>
            <input
              type="text"
              aria-label="Order Number"
              value={lookupForm.orderNumber}
              onChange={(e) => {
                setLookupForm({ ...lookupForm, orderNumber: e.target.value });
                if (error) setError(null);
              }}
              className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] font-mono placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
              placeholder="Order Number (e.g. TBE-2026-89329)"
            />
          </div>

          <div>
            <input
              type="email"
              aria-label="Billing / Contact Email"
              value={lookupForm.email}
              aria-invalid={error ? 'true' : undefined}
              onChange={(e) => {
                setLookupForm({ ...lookupForm, email: e.target.value });
                if (error) setError(null);
              }}
              className="w-full bg-white/70 border border-[#DDD5CA] px-3.5 py-2.5 text-[12px] text-[#4A3025] placeholder-[#B5ADA4] focus:outline-none focus:border-[#4A3025] focus:bg-white transition-all rounded-none"
              placeholder="Billing / Contact Email"
            />
          </div>

          {error && (
            <p className="text-[11px] text-[var(--color-wine)] tracking-wide font-body text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 bg-[#4A3025] text-[#FAF6F0] text-[10px] uppercase tracking-[0.22em] font-medium hover:bg-[#34221A] transition-colors cursor-pointer rounded-none mt-2"
          >
            Track Guest Order
          </button>
        </form>
      )}
    </div>
  );
}
