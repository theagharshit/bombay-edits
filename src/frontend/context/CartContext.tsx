'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { CartItem } from '@/types/cart';
import { getDeviceFingerprint } from '@/frontend/utils/deviceFingerprint';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; size: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; size: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'HYDRATE'; payload: CartItem[] };

function isSameCartItem(
  a?: { productId?: string; slug?: string; size?: string; colour?: string },
  b?: { productId?: string; slug?: string; size?: string; colour?: string }
): boolean {
  if (!a || !b) return false;
  const matchId =
    (a.productId && b.productId && a.productId === b.productId) ||
    (a.slug && b.slug && a.slug === b.slug) ||
    (a.productId && b.slug && a.productId === b.slug) ||
    (a.slug && b.productId && a.slug === b.productId);

  const sizeA = (a.size || 'standard').toLowerCase().trim();
  const sizeB = (b.size || 'standard').toLowerCase().trim();

  const colourA = (a.colour || '').toLowerCase().trim();
  const colourB = (b.colour || '').toLowerCase().trim();
  const matchColour = !colourA || !colourB || colourA === colourB;

  return Boolean(matchId && sizeA === sizeB && matchColour);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex((i) => isSameCartItem(i, action.payload));
      if (existingIndex >= 0) {
        const existing = state.items[existingIndex];
        const max = action.payload.maxQuantity || existing.maxQuantity || 10;
        const addQty = action.payload.quantity || 1;
        const newQty = Math.min(existing.quantity + addQty, max);

        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...existing,
          productId: existing.productId || action.payload.productId,
          slug: existing.slug || action.payload.slug,
          name: action.payload.name || existing.name,
          image: action.payload.image || existing.image,
          price: action.payload.price || existing.price,
          quantity: newQty,
        };

        return {
          ...state,
          isOpen: true,
          items: updatedItems,
        };
      }
      return { ...state, isOpen: true, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => !isSameCartItem(i, action.payload)),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map((i) =>
            isSameCartItem(i, action.payload)
              ? {
                  ...i,
                  quantity: Math.max(0, Math.min(action.payload.quantity, i.maxQuantity || 10)),
                }
              : i
          )
          .filter((i) => i.quantity > 0),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'HYDRATE':
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

import { useAuth } from '@/frontend/context/AuthContext';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const isHydratedRef = useRef(false);
  const { customer, isAuthenticated } = useAuth();

  // Listen for login/register cart synchronization events
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<CartItem[]>;
      if (customEvent.detail && Array.isArray(customEvent.detail)) {
        dispatch({ type: 'HYDRATE', payload: customEvent.detail });
      }
    };
    window.addEventListener('tbe-cart-sync', handleSync);
    return () => window.removeEventListener('tbe-cart-sync', handleSync);
  }, []);

  // Hydrate from localStorage first, then sync with database (/api/cart)
  useEffect(() => {
    let localItems: CartItem[] = [];
    try {
      const saved = localStorage.getItem('tbe-cart');
      if (saved) {
        localItems = JSON.parse(saved);
        dispatch({ type: 'HYDRATE', payload: localItems });
      }
    } catch {
      // Ignore parse errors
    }

    async function syncCartWithDb() {
      try {
        const fp = getDeviceFingerprint();
        const res = await fetch('/api/cart', {
          headers: fp ? { 'x-device-fingerprint': fp } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data.items)) {
            const dbCart: CartItem[] = json.data.items;
            if (dbCart.length > 0) {
              dispatch({ type: 'HYDRATE', payload: dbCart });
              localStorage.setItem('tbe-cart', JSON.stringify(dbCart));
            } else if (localItems.length > 0) {
              // Push local items to DB
              fetch('/api/cart', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(fp ? { 'x-device-fingerprint': fp } : {}),
                },
                body: JSON.stringify({
                  action: 'update',
                  items: localItems,
                  deviceFingerprint: fp,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Fallback to local storage
      } finally {
        isHydratedRef.current = true;
      }
    }

    syncCartWithDb();
  }, [customer?.id, isAuthenticated]);

  // Persist to localStorage and database on change
  useEffect(() => {
    localStorage.setItem('tbe-cart', JSON.stringify(state.items));

    // Only sync to DB after initial hydration is completed
    if (isHydratedRef.current) {
      const timer = setTimeout(() => {
        const fp = getDeviceFingerprint();
        fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(fp ? { 'x-device-fingerprint': fp } : {}),
          },
          body: JSON.stringify({
            action: 'update',
            items: state.items,
            deviceFingerprint: fp,
          }),
        }).catch(() => {});
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = useCallback(
    (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }),
    []
  );
  const removeItem = useCallback(
    (productId: string, size: string) =>
      dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } }),
    []
  );
  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } }),
    []
  );
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    try {
      localStorage.removeItem('tbe-cart');
    } catch {
      // ignore
    }

    const fp = getDeviceFingerprint();
    fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(fp ? { 'x-device-fingerprint': fp } : {}),
      },
      body: JSON.stringify({ action: 'clear', deviceFingerprint: fp }),
    }).catch(() => {});
  }, []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
