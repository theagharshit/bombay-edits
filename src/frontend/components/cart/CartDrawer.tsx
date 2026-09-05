'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice as format } from '@/frontend/utils/formatters';

const FREE_SHIPPING_THRESHOLD = 5000;

// Hardcoded recommendations for the empty state
const RECOMMENDED_PRODUCTS = [
  {
    id: '1',
    slug: 'festive-kurta',
    name: 'Festive Kurta',
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&h=400&q=80',
    price: 2999,
  },
  {
    id: '2',
    slug: 'silk-coord',
    name: 'Silk Co-ord',
    image:
      'https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=300&h=400&q=80',
    price: 4500,
  },
  {
    id: '3',
    slug: 'embroidered-shirt',
    name: 'Embroidered Shirt',
    image:
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&w=300&h=400&q=80',
    price: 1800,
  },
  {
    id: '4',
    slug: 'zari-sharara',
    name: 'Zari Sharara',
    image:
      'https://images.unsplash.com/photo-1524228529766-4d7fe5dc55ca?auto=format&fit=crop&w=300&h=400&q=80',
    price: 3200,
  },
  {
    id: '5',
    slug: 'velvet-tunic',
    name: 'Velvet Tunic',
    image:
      'https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=300&h=400&q=80',
    price: 2500,
  },
  {
    id: '6',
    slug: 'classic-dupatta',
    name: 'Classic Dupatta',
    image:
      'https://images.unsplash.com/photo-1571587289339-cb7da03fb5a6?auto=format&fit=crop&w=300&h=400&q=80',
    price: 900,
  },
];

export function CartDrawer() {
  const { isOpen, closeCart, items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm z-[80] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-ivory shadow-drawer z-[100] transform transition-transform duration-slow ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-line)] shrink-0 bg-[var(--color-ivory)] relative z-10">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[24px] text-[var(--color-ink)]">Your Bag</h2>
            <span className="font-body text-[12px] text-[var(--color-muted)]">({itemCount})</span>
          </div>
          <button
            onClick={closeCart}
            className="p-1 text-[var(--color-ink)] hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            aria-label="Close cart"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="shrink-0 bg-[var(--color-shell)] p-6 border-b border-[var(--color-line)] relative z-10">
          <p className="font-body text-[11px] uppercase tracking-[0.1em] text-[var(--color-ink)] mb-3 text-center">
            {remainingForFreeShipping > 0
              ? `Add ${format(remainingForFreeShipping)} more for complimentary shipping`
              : 'You qualify for complimentary shipping'}
          </p>
          <div className="w-full h-1 bg-[var(--color-line)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-ink)] transition-all duration-500 ease-out"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
                <p className="font-display text-[22px] text-[var(--color-ink)] mb-3">
                  Your bag is empty
                </p>
                <p className="font-body text-[14px] text-[var(--color-muted)]">
                  Discover our collection of handcrafted Indian ethnic wear.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-8 font-body text-[11px] uppercase tracking-[0.1em] text-[var(--color-ink)] border-b border-[var(--color-ink)] pb-1 hover:opacity-70 transition-opacity"
                >
                  Explore The Edit
                </Link>
              </div>

              {/* Recommended Products (Horizontal Scroll) */}
              <div className="pb-8 border-t border-[var(--color-line)] pt-8">
                <h3 className="font-display text-[18px] text-[var(--color-ink)] px-6 mb-6">
                  Recommended for you
                </h3>
                <div className="flex overflow-x-auto px-6 gap-4 pb-4 snap-x hide-scrollbar">
                  {RECOMMENDED_PRODUCTS.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      onClick={closeCart}
                      className="flex-none w-[140px] group snap-start"
                    >
                      <div className="relative w-full aspect-[3/4] mb-3 bg-[var(--color-shell)]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:opacity-90 transition-opacity"
                        />
                      </div>
                      <p className="font-display text-[14px] text-[var(--color-ink)] truncate">
                        {product.name}
                      </p>
                      <p className="font-body text-[12px] text-[var(--color-muted)] mt-1">
                        {format(product.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="p-6 flex gap-6 border-b border-[var(--color-line)]"
                >
                  <Link
                    href={`/shop/${item.slug}`}
                    onClick={closeCart}
                    className="relative w-[100px] aspect-[3/4] flex-shrink-0 bg-[var(--color-shell)] hover:opacity-90 transition-opacity"
                  >
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </Link>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={closeCart}
                        className="font-display text-[18px] text-[var(--color-ink)] hover:opacity-70 transition-opacity line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-2 flex flex-col gap-1">
                        <p className="font-body text-[11px] uppercase tracking-[0.05em] text-[var(--color-muted)]">
                          Color: {item.colour}
                        </p>
                        <p className="font-body text-[11px] uppercase tracking-[0.05em] text-[var(--color-muted)]">
                          Size: {item.size}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-4 border border-[var(--color-line)] px-2 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-none"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span className="font-body text-[12px] text-[var(--color-ink)] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-none"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="font-body text-[14px] text-[var(--color-ink)]">
                          {format(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="font-body text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors underline underline-offset-4"
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

        {/* Sticky Footer */}
        {items.length > 0 && (
          <div className="shrink-0 bg-[var(--color-shell)] p-6 border-t border-[var(--color-line)]">
            <div className="flex items-end justify-between mb-4">
              <span className="font-body text-[12px] uppercase tracking-[0.1em] text-[var(--color-ink)]">
                Subtotal
              </span>
              <span className="font-display text-[22px] text-[var(--color-ink)]">
                {format(subtotal)}
              </span>
            </div>

            <p className="font-body text-[11px] text-[var(--color-muted)] mb-6 text-center">
              Tax calculated at checkout
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-[var(--color-ink)] text-[var(--color-ivory)] font-body text-[12px] uppercase tracking-[0.1em] text-center py-4 hover:opacity-90 transition-opacity"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
