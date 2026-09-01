'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { CartItem } from '@/types/cart';

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
        i => i.productId === action.payload.productId && i.size === action.payload.size
      );
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map(i =>
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
          i => !(i.productId === action.payload.productId && i.size === action.payload.size)
        ),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.payload.productId && i.size === action.payload.size
            ? { ...i, quantity: Math.max(0, Math.min(action.payload.quantity, i.maxQuantity)) }
            : i
        ).filter(i => i.quantity > 0),
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

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tbe-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('tbe-cart', JSON.stringify(state.items));
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addItem = useCallback((item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item }), []);
  const removeItem = useCallback((productId: string, size: string) => dispatch({ type: 'REMOVE_ITEM', payload: { productId, size } }), []);
  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, size, quantity } }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);

  return (
    <CartContext.Provider value={{
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
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
