'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';

export function AtelierAuthGate() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'guest-lookup'>('signin');
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
    setSubmitting(true);
    try {
      await login(loginForm);
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
    setSubmitting(true);
    try {
      await register(regForm);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupForm.orderNumber.trim()) return;
    router.push(
      `/order-confirmation?orderNumber=${encodeURIComponent(lookupForm.orderNumber.trim())}`
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-14 px-4 font-body">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A817C] mb-2 block font-medium">
          Private Client Access
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-[#4A3025] tracking-tight">
          The Atelier
        </h1>
        <p className="text-[13px] text-[#8A817C] mt-2 max-w-md mx-auto leading-relaxed">
          Sign in for personalized appointments, saved atelier measurements, and bespoke archives.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5DFD5] mb-8">
        <button
          onClick={() => {
            setActiveTab('signin');
            setError(null);
          }}
          className={`flex-1 py-3 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer text-center ${
            activeTab === 'signin'
              ? 'border-b-2 border-[#4A3025] text-[#4A3025] font-semibold'
              : 'text-[#8A817C] hover:text-[#4A3025]'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setActiveTab('register');
            setError(null);
          }}
          className={`flex-1 py-3 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer text-center ${
            activeTab === 'register'
              ? 'border-b-2 border-[#4A3025] text-[#4A3025] font-semibold'
              : 'text-[#8A817C] hover:text-[#4A3025]'
          }`}
        >
          Create Account
        </button>
        <button
          onClick={() => {
            setActiveTab('guest-lookup');
            setError(null);
          }}
          className={`flex-1 py-3 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer text-center ${
            activeTab === 'guest-lookup'
              ? 'border-b-2 border-[#4A3025] text-[#4A3025] font-semibold'
              : 'text-[#8A817C] hover:text-[#4A3025]'
          }`}
        >
          Guest Lookup
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-900 text-xs tracking-wide">
          {error}
        </div>
      )}

      {/* Sign In Form */}
      {activeTab === 'signin' && (
        <form
          onSubmit={handleLogin}
          className="space-y-6 bg-white/70 border border-[#E5DFD5] p-6 sm:p-8"
        >
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              required
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
              placeholder="e.g. client@bombayedits.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              required
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#4A3025] text-[#FAF6F0] text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#34221A] disabled:opacity-50 transition-colors cursor-pointer rounded-none"
          >
            {submitting ? 'Entering Atelier...' : 'Sign In'}
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form
          onSubmit={handleRegister}
          className="space-y-5 bg-white/70 border border-[#E5DFD5] p-6 sm:p-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
                First Name
              </label>
              <input
                type="text"
                required
                value={regForm.firstName}
                onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
                placeholder="Anya"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
                Last Name
              </label>
              <input
                type="text"
                value={regForm.lastName}
                onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
                placeholder="Sharma"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              required
              value={regForm.email}
              onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
              className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
              placeholder="client@bombayedits.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={regForm.phone}
              onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
              className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
              placeholder="+91 98200 00000"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
              Password (Min 6 Characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={regForm.password}
              onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
              className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#4A3025] text-[#FAF6F0] text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#34221A] disabled:opacity-50 transition-colors cursor-pointer rounded-none mt-2"
          >
            {submitting ? 'Creating Membership...' : 'Create Atelier Account'}
          </button>
        </form>
      )}

      {/* Guest Order Lookup */}
      {activeTab === 'guest-lookup' && (
        <form
          onSubmit={handleLookup}
          className="space-y-6 bg-white/70 border border-[#E5DFD5] p-6 sm:p-8"
        >
          <p className="text-[13px] text-[#8A817C] leading-relaxed">
            Placed an order as a guest? Enter your consignment order number to review dispatch
            status and details without creating an account.
          </p>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
              Order Number
            </label>
            <input
              type="text"
              required
              value={lookupForm.orderNumber}
              onChange={(e) => setLookupForm({ ...lookupForm, orderNumber: e.target.value })}
              className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] font-mono focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
              placeholder="e.g. TBE-2026-89329"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[#8A817C] mb-2 font-medium">
              Billing / Contact Email
            </label>
            <input
              type="email"
              required
              value={lookupForm.email}
              onChange={(e) => setLookupForm({ ...lookupForm, email: e.target.value })}
              className="w-full bg-[#FAF6F0] border border-[#E5DFD5] px-4 py-3 text-[13px] text-[#4A3025] focus:outline-none focus:border-[#4A3025] transition-colors rounded-none"
              placeholder="email used at checkout"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#4A3025] text-[#FAF6F0] text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-[#34221A] transition-colors cursor-pointer rounded-none"
          >
            Track Guest Order
          </button>
        </form>
      )}
    </div>
  );
}
