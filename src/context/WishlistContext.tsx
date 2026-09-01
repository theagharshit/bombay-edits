'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { WishlistItem } from '@/types/cart';

interface WishlistContextValue {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tbe-wishlist');
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Ignore parse errors
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tbe-wishlist', JSON.stringify(items));
  }, [items]);

  const isWishlisted = useCallback(
    (productId: string) => items.some(i => i.productId === productId),
    [items]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setItems(prev => {
      const exists = prev.find(i => i.productId === productId);
      if (exists) return prev.filter(i => i.productId !== productId);
      return [...prev, { productId, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);

  return (
    <WishlistContext.Provider value={{
      items,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      count: items.length,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
