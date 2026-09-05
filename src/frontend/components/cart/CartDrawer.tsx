'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice as format } from '@/frontend/utils/formatters';

const FREE_SHIPPING_THRESHOLD = 5000;

// Curated atelier recommendations for the empty state
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
  const { isOpen, closeCart, clearCart, items, itemCount, subtotal, removeItem, updateQuantity } =
    useCart();
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
        className={`fixed inset-0 bg-[#2C1810]/40 backdrop-blur-sm z-[80] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container (Strict Viewport Height Flex Column) */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[490px] md:w-[520px] max-w-full bg-[#FAF6F0] shadow-2xl z-[100] transform transition-transform duration-500 ease-out flex flex-col h-full max-h-screen overflow-hidden font-body ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
      >
        {/* 1. Header (Pinned at top) */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#E5DFD5] shrink-0 bg-[#FAF6F0] z-20">
          <div className="flex items-baseline gap-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A817C] font-medium block">
              The Edit
            </span>
            <h2 className="font-display text-[22px] sm:text-[24px] text-[#4A3025] tracking-tight">
              Your Bag
            </h2>
            <span className="font-body text-[11px] uppercase tracking-[0.15em] px-2.5 py-0.5 bg-[#F4EFEA] text-[#8A817C] rounded-full font-medium">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-[#4A3025] hover:text-[#8A817C] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4A3025] cursor-pointer"
            aria-label="Close cart"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {/* 2. Free Shipping Indicator (Pinned at top) */}
        <div className="shrink-0 bg-[#F4EFEA] px-6 sm:px-8 py-3.5 border-b border-[#E5DFD5] z-10">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-[#4A3025] font-medium mb-2">
            <span>
              {remainingForFreeShipping > 0
                ? `Add ${format(remainingForFreeShipping)} for complimentary dispatch`
                : '✓ Complimentary atelier dispatch unlocked'}
            </span>
            <span className="text-[10px] text-[#8A817C]">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full h-1 bg-[#E5DFD5] overflow-hidden rounded-full">
            <div
              className="h-full bg-[#4A3025] transition-all duration-500 ease-out rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* 3. Scrollable Items Area (Exclusively scrollable with custom styling) */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 divide-y divide-[#E5DFD5]">
          {items.length === 0 ? (
            <div className="flex flex-col h-full py-12">
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEA] border border-[#E5DFD5] flex items-center justify-center text-[#8A817C] mb-5">
                  <ShoppingBag size={24} strokeWidth={1.2} />
                </div>
                <p className="font-display text-[22px] sm:text-[24px] text-[#4A3025] mb-2">
                  Your bag is empty
                </p>
                <p className="font-body text-[13px] text-[#8A817C] max-w-xs leading-relaxed mb-6">
                  Discover handcrafted heirlooms and contemporary artisanal couture from our Bombay
                  ateliers.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.2em] text-[#4A3025] border-b border-[#4A3025] pb-1 hover:opacity-70 transition-opacity font-medium"
                >
                  <span>Explore The Collection</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Recommended Rail */}
              <div className="pt-8 border-t border-[#E5DFD5] mt-auto">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8A817C] font-semibold">
                    Curated Suggestions
                  </span>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="text-[10px] uppercase tracking-[0.15em] text-[#4A3025] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x hide-scrollbar">
                  {RECOMMENDED_PRODUCTS.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      onClick={closeCart}
                      className="flex-none w-[130px] group snap-start"
                    >
                      <div className="relative w-full aspect-[3/4] mb-2.5 bg-[#F4EFEA] overflow-hidden rounded-[2px]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="130px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <p className="font-display text-[13px] text-[#4A3025] truncate">
                        {product.name}
                      </p>
                      <p className="font-body text-[11px] text-[#8A817C] mt-0.5 font-medium">
                        {format(product.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.slug}-${item.size}`}
                  className="py-6 flex gap-5 first:pt-4 last:pb-4 group"
                >
                  {/* Item Image */}
                  <Link
                    href={`/shop/${item.slug || item.productId}`}
                    onClick={closeCart}
                    className="relative w-[95px] sm:w-[105px] aspect-[3/4] flex-shrink-0 bg-[#F4EFEA] overflow-hidden rounded-[2px] border border-[#E5DFD5]/60 hover:opacity-95 transition-opacity"
                  >
                    <Image
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      fill
                      sizes="105px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Item Details */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/shop/${item.slug || item.productId}`}
                          onClick={closeCart}
                          className="font-display text-[16px] sm:text-[17px] text-[#4A3025] hover:text-[#8A817C] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <span className="font-display text-[15px] sm:text-[16px] text-[#4A3025] shrink-0 font-medium">
                          {format(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.1em] text-[#8A817C]">
                        {item.colour && (
                          <span>
                            Color:{' '}
                            <strong className="text-[#4A3025] font-normal">{item.colour}</strong>
                          </span>
                        )}
                        {item.size && (
                          <>
                            <span className="opacity-40">•</span>
                            <span>
                              Size:{' '}
                              <strong className="text-[#4A3025] font-normal">{item.size}</strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector & Remove Action */}
                    <div className="flex items-center justify-between mt-5 pt-2">
                      {/* Quantity Controls */}
                      <div className="inline-flex items-center border border-[#E5DFD5] bg-[#FAF6F0] rounded-[2px]">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-[#8A817C] hover:text-[#4A3025] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={11} strokeWidth={2} />
                        </button>
                        <span className="w-8 text-center font-body text-[12px] font-medium text-[#4A3025]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-[#8A817C] hover:text-[#4A3025] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={11} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#8A817C] hover:text-[#B33939] transition-colors cursor-pointer group/btn"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} className="opacity-70 group-hover/btn:opacity-100" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Sticky Footer (Permanently Pinned at Bottom) */}
        {items.length > 0 && (
          <div className="shrink-0 bg-[#F4EFEA] px-6 sm:px-8 py-5 border-t border-[#E5DFD5] shadow-[0_-12px_28px_rgba(74,48,37,0.07)] z-20">
            {/* Subtotal breakdown */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-body text-[11px] uppercase tracking-[0.2em] text-[#8A817C] font-semibold">
                Estimated Subtotal
              </span>
              <span className="font-display text-[22px] sm:text-[24px] text-[#4A3025] font-medium">
                {format(subtotal)}
              </span>
            </div>

            <p className="font-body text-[11px] text-[#8A817C] mb-5 flex items-center justify-between">
              <span>Delivery & taxes</span>
              <span className="text-[#4A3025] font-medium">
                {remainingForFreeShipping === 0 ? 'Complimentary' : 'Calculated at checkout'}
              </span>
            </p>

            {/* Primary Action Button */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-3 w-full bg-[#4A3025] text-[#FAF6F0] font-body text-[11px] uppercase tracking-[0.22em] font-medium py-4 px-6 hover:bg-[#382319] active:scale-[0.99] transition-all duration-300 shadow-md hover:shadow-lg rounded-[2px] group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary actions: Clear bag & Continue browsing */}
            <div className="flex items-center justify-between mt-3.5 pt-2 text-[10px] uppercase tracking-[0.18em] text-[#8A817C]">
              <button
                onClick={closeCart}
                className="hover:text-[#4A3025] transition-colors cursor-pointer underline underline-offset-4"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all items from your shopping bag?')) {
                    clearCart();
                  }
                }}
                className="hover:text-[#B33939] transition-colors cursor-pointer"
              >
                Clear Entire Bag
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
