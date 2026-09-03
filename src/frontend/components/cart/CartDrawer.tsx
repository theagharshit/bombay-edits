'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { generatePlaceholderImage } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD_MUMBAI } from '@/data/shipping';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { format } = useCurrency();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD_MUMBAI) * 100, 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD_MUMBAI - subtotal;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80]"
          style={{ backgroundColor: 'rgba(74, 48, 37, 0.4)' }}
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`fixed top-0 right-0 h-full w-[90vw] max-w-md z-[90]
          transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          backgroundColor: '#FAF6F0',
          transitionDuration: 'var(--duration-slow)',
          transitionTimingFunction: 'var(--ease-out)',
          boxShadow: isOpen ? '-10px 0 30px rgba(0,0,0,0.05)' : 'none',
        }}
      >
        <div className="flex flex-col h-full font-body">
          {/* Header */}
          <div
            className="flex items-center justify-between p-6"
            style={{ borderBottom: '1px solid #E5DFD5' }}
          >
            <h2 className="font-display text-2xl" style={{ color: '#4A3025' }}>
              Your Archives ({itemCount})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 transition-opacity hover:opacity-70"
              style={{ color: '#4A3025' }}
              aria-label="Close bag"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Free shipping progress */}
          {items.length > 0 && (
            <div
              className="px-6 py-4"
              style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #E5DFD5' }}
            >
              <div className="w-full h-1 overflow-hidden" style={{ backgroundColor: '#E5DFD5' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: '#4A3025',
                    width: `${freeShippingProgress}%`,
                    transitionDuration: 'var(--duration-slow)',
                  }}
                />
              </div>
              <p
                className="text-[11px] uppercase tracking-[0.1em] mt-3"
                style={{ color: '#8A817C' }}
              >
                {remainingForFreeShipping > 0
                  ? `Add ${format(remainingForFreeShipping)} more for complimentary shipping`
                  : 'You qualify for complimentary shipping'}
              </p>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <p className="font-display text-2xl mb-2" style={{ color: '#4A3025' }}>
                  Your bag is empty
                </p>
                <p className="text-sm mb-8" style={{ color: '#8A817C' }}>
                  Discover our collection of handcrafted Indian ethnic wear.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-block px-8 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors"
                  style={{ backgroundColor: '#4A3025', color: '#FAF6F0' }}
                >
                  Explore The Edit
                </Link>
              </div>
            ) : (
              <div>
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="p-6 flex gap-6"
                    style={{ borderBottom: '1px solid #E5DFD5' }}
                  >
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeCart}
                      className="relative w-24 aspect-[4/5] flex-shrink-0 p-1"
                      style={{ border: '1px solid #E5DFD5', backgroundColor: '#FAF8F5' }}
                    >
                      <Image
                        src={item.image || generatePlaceholderImage(160, 213, item.productId)}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeCart}
                          className="font-display text-xl block truncate hover:opacity-70 transition-opacity"
                          style={{ color: '#4A3025' }}
                        >
                          {item.name}
                        </Link>
                        <p
                          className="text-[10px] uppercase tracking-[0.1em] mt-2"
                          style={{ color: '#8A817C' }}
                        >
                          Color: {item.colour}
                        </p>
                        <p
                          className="text-[10px] uppercase tracking-[0.1em] mt-1"
                          style={{ color: '#8A817C' }}
                        >
                          Size: {item.size}
                        </p>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div
                          className="flex items-center gap-3 text-xs pb-1"
                          style={{ borderBottom: '1px solid #E5DFD5', color: '#8A817C' }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity - 1)
                            }
                            className="hover:opacity-70 transition-opacity"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span style={{ color: '#4A3025' }}>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity + 1)
                            }
                            className="hover:opacity-70 transition-opacity"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-display text-lg" style={{ color: '#4A3025' }}>
                            {format(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity"
                            style={{ color: '#7d3f3f' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div
              className="p-6 space-y-6"
              style={{ backgroundColor: '#FAF8F5', borderTop: '1px solid #E5DFD5' }}
            >
              <div className="flex items-end justify-between">
                <span
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: '#8A817C' }}
                >
                  Subtotal
                </span>
                <span className="text-3xl font-display" style={{ color: '#4A3025' }}>
                  {format(subtotal)}
                </span>
              </div>
              <p
                className="text-[10px] uppercase tracking-[0.1em] text-center"
                style={{ color: '#8A817C' }}
              >
                Shipping and taxes calculated at checkout
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full text-center py-4 text-[10px] uppercase tracking-[0.2em] transition-colors"
                  style={{
                    border: '1px solid #4A3025',
                    color: '#4A3025',
                    backgroundColor: 'transparent',
                  }}
                >
                  View full bag
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full text-center py-4 text-[10px] uppercase tracking-[0.2em] transition-colors"
                  style={{ backgroundColor: '#4A3025', color: '#FAF6F0' }}
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
