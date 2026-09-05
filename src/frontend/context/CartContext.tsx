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

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId && i.size === action.payload.size
      );
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.productId === action.payload.productId && i.size === action.payload.size
              ? { ...i, quantity: Math.min(i.quantity + action.payload.quantity, i.maxQuantity) }
              : i
          ),
        };
      }
      return { ...state, isOpen: true, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.productId === action.payload.productId && i.size === action.payload.size)
        ),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.productId === action.payload.productId && i.size === action.payload.size
              ? { ...i, quantity: Math.max(0, Math.min(action.payload.quantity, i.maxQuantity)) }
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const isHydratedRef = useRef(false);

  // Hydrate from localStorage first, then sync with DB guest session
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

    // Fetch persistent guest session from database
    async function syncCartWithDb() {
      try {
        const fp = getDeviceFingerprint();
        const res = await fetch('/api/guest-session', {
          headers: fp ? { 'x-device-fingerprint': fp } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data.cart)) {
            const dbCart: CartItem[] = json.data.cart;
            if (dbCart.length > 0) {
              dispatch({ type: 'HYDRATE', payload: dbCart });
              localStorage.setItem('tbe-cart', JSON.stringify(dbCart));
            } else if (localItems.length > 0) {
              // Push local items to DB guest session
              fetch('/api/guest-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(fp ? { 'x-device-fingerprint': fp } : {}),
                },
                body: JSON.stringify({
                  action: 'update_cart',
                  items: localItems,
                  deviceFingerprint: fp,
                }),
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Fallback to local storage if API is unreachable
      } finally {
        isHydratedRef.current = true;
      }
    }

    syncCartWithDb();
  }, []);

  // Persist to localStorage and DB guest session on change
  useEffect(() => {
    localStorage.setItem('tbe-cart', JSON.stringify(state.items));

    // Only sync to DB after initial hydration is completed
    if (isHydratedRef.current) {
      const timer = setTimeout(() => {
        const fp = getDeviceFingerprint();
        fetch('/api/guest-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(fp ? { 'x-device-fingerprint': fp } : {}),
          },
          body: JSON.stringify({
            action: 'update_cart',
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
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
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
