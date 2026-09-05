'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { WishlistItem } from '@/types/cart';
import { getDeviceFingerprint } from '@/frontend/utils/deviceFingerprint';

interface WishlistContextValue {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function getOrCreateUserIdentifier(): string {
  if (typeof window === 'undefined') return 'guest';
  let userId = localStorage.getItem('tbe-user-id');
  if (!userId) {
    userId = `usr_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
    localStorage.setItem('tbe-user-id', userId);
  }
  return userId;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [userIdentifier, setUserIdentifier] = useState<string>('guest');

  // Initialize userIdentifier and fetch wishlist from API infrastructure
  useEffect(() => {
    const userId = getOrCreateUserIdentifier();
    setUserIdentifier(userId);

    // Initial local storage load for instant render
    try {
      const saved = localStorage.getItem('tbe-wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Ignore parse error
    }

    // Sync with database via API infrastructure
    async function syncWishlistFromApi() {
      try {
        const res = await fetch(`/api/v1/wishlist?userIdentifier=${encodeURIComponent(userId)}`, {
          headers: {
            'x-user-identifier': userId,
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data.items)) {
            setItems(json.data.items);
            localStorage.setItem('tbe-wishlist', JSON.stringify(json.data.items));
          }
        }
      } catch {
        // Fallback to local storage if API call fails
      }
    }

    syncWishlistFromApi();
  }, []);

  // Save to local storage and DB guest session whenever items change
  useEffect(() => {
    localStorage.setItem('tbe-wishlist', JSON.stringify(items));

    const fp = getDeviceFingerprint();
    // Also persist to guest_sessions table in DB
    fetch('/api/guest-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(fp ? { 'x-device-fingerprint': fp } : {}),
      },
      body: JSON.stringify({ action: 'update_wishlist', items, deviceFingerprint: fp }),
    }).catch(() => {});
  }, [items]);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const currentUserId = userIdentifier || getOrCreateUserIdentifier();

      // 1. Optimistic update
      setItems((prev) => {
        const exists = prev.find((i) => i.productId === productId);
        if (exists) return prev.filter((i) => i.productId !== productId);
        return [...prev, { productId, addedAt: new Date().toISOString() }];
      });

      // 2. Persist to API Infrastructure & Prisma DB
      try {
        const res = await fetch('/api/v1/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-identifier': currentUserId,
          },
          body: JSON.stringify({
            productId,
            action: 'toggle',
            userIdentifier: currentUserId,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data.items)) {
            setItems(json.data.items);
            localStorage.setItem('tbe-wishlist', JSON.stringify(json.data.items));
          }
        }
      } catch {
        // Keep optimistic state in local storage on network error
      }
    },
    [userIdentifier]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const currentUserId = userIdentifier || getOrCreateUserIdentifier();

      setItems((prev) => prev.filter((i) => i.productId !== productId));

      try {
        const res = await fetch('/api/v1/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-identifier': currentUserId,
          },
          body: JSON.stringify({
            productId,
            action: 'remove',
            userIdentifier: currentUserId,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data.items)) {
            setItems(json.data.items);
            localStorage.setItem('tbe-wishlist', JSON.stringify(json.data.items));
          }
        }
      } catch {
        // Keep optimistic state
      }
    },
    [userIdentifier]
  );

  const clearWishlist = useCallback(async () => {
    const currentUserId = userIdentifier || getOrCreateUserIdentifier();

    setItems([]);
    localStorage.removeItem('tbe-wishlist');

    try {
      await fetch('/api/v1/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-identifier': currentUserId,
        },
        body: JSON.stringify({
          action: 'clear',
          userIdentifier: currentUserId,
        }),
      });
    } catch {
      // Keep optimistic clear
    }
  }, [userIdentifier]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
