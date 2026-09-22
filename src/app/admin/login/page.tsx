'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn('credentials', {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        redirect: false,
      });

      if (result?.error) {
        setError('Incorrect email or password');
        setLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError('Incorrect email or password');
        setLoading(false);
      }
    } catch {
      setError('Incorrect email or password');
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-root min-h-screen flex items-center justify-center p-6"
      style={{ background: '#fafaf9' }}
    >
      <div className="w-full max-w-sm bg-white border border-[#e7e5e4] rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1c1917' }}>
            Operator
          </h1>
          <p className="text-sm mt-2" style={{ color: '#78716c' }}>
            Sign in to manage the store
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="p-3 text-sm rounded-md text-center"
              style={{ background: 'rgba(185,28,28,0.08)', color: '#b91c1c' }}
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label
              className="block text-sm font-medium"
              style={{ color: '#1c1917' }}
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: '#e7e5e4',
                background: '#ffffff',
                color: '#1c1917',
              }}
              placeholder="admin@thebombayedit.com"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="block text-sm font-medium"
              style={{ color: '#1c1917' }}
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: '#e7e5e4',
                background: '#ffffff',
                color: '#1c1917',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-medium transition-opacity disabled:opacity-60"
            style={{
              background: '#1c1917',
              color: '#ffffff',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
