'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/frontend/context/AuthContext';

function OrdersRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/account/orders');
    } else {
      const orderNum = searchParams.get('orderNumber');
      const email = searchParams.get('email');
      if (orderNum && email) {
        router.replace(
          `/account/orders?orderNumber=${encodeURIComponent(orderNum)}&email=${encodeURIComponent(
            email
          )}`
        );
      } else {
        router.replace('/account?tab=guest-lookup');
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#4A3025] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#4A3025] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrdersRedirect />
    </Suspense>
  );
}
