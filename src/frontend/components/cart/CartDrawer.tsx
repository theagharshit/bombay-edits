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
        <div className="fixed inset-0 bg-ink/30 z-[80]" onClick={closeCart} aria-hidden="true" />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`fixed top-0 right-0 h-full w-[90vw] max-w-md bg-ivory z-[90]
          transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          transitionDuration: 'var(--duration-slow)',
          transitionTimingFunction: 'var(--ease-out)',
          boxShadow: isOpen ? 'var(--shadow-drawer)' : 'none',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display text-xl text-ink">Your bag ({itemCount})</h2>
            <button
              onClick={closeCart}
              className="p-2 text-deep-brown hover:text-ink"
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
            <div className="px-5 py-3 bg-cream">
              <div className="w-full h-1 bg-beige rounded-full overflow-hidden">
                <div
                  className="h-full bg-muted-green rounded-full transition-all"
                  style={{
                    width: `${freeShippingProgress}%`,
                    transitionDuration: 'var(--duration-slow)',
                  }}
                />
              </div>
              <p className="text-xs text-text-muted mt-2 font-body">
                {remainingForFreeShipping > 0
                  ? `Add ${format(remainingForFreeShipping)} more for free shipping within Mumbai`
                  : 'You qualify for free shipping within Mumbai'}
              </p>
            </div>
          )}

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-beige mb-4"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p className="font-display text-lg text-ink mb-2">Your bag is empty</p>
                <p className="text-sm text-text-muted mb-6">
                  Discover our collection of handcrafted Indian ethnic wear.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-block bg-ink text-ivory px-6 py-3 text-sm font-body rounded-sm hover:bg-deep-brown transition-colors"
                  style={{ transitionDuration: 'var(--duration-fast)' }}
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="p-5 flex gap-4">
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={closeCart}
                      className="relative w-20 h-26 flex-shrink-0 bg-cream"
                    >
                      <Image
                        src={item.image || generatePlaceholderImage(160, 213, item.productId)}
                        alt={item.name}
                        width={80}
                        height={107}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-body text-ink hover:text-deep-brown block truncate"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-text-muted mt-1">
                        {item.colour} · {item.size}
                      </p>
                      <p className="text-sm text-ink mt-1 font-body">{format(item.price)}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border rounded-sm">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-ink text-sm"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-7 h-7 flex items-center justify-center text-xs text-ink font-body">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.size, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-ink text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-xs text-text-muted hover:text-wine transition-colors underline"
                          style={{ transitionDuration: 'var(--duration-fast)' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-deep-brown font-body">Subtotal</span>
                <span className="text-base text-ink font-display">{format(subtotal)}</span>
              </div>
              <p className="text-xs text-text-muted">Shipping and taxes calculated at checkout</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-ink text-ivory text-center py-3.5 text-sm font-body rounded-sm hover:bg-deep-brown transition-colors"
                style={{ transitionDuration: 'var(--duration-fast)' }}
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full text-center py-2 text-sm font-body text-deep-brown hover:text-ink transition-colors underline"
                style={{ transitionDuration: 'var(--duration-fast)' }}
              >
                View full bag
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
