'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { generatePlaceholderImage } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { format } = useCurrency();

  const relatedProducts = products.slice(0, 4);

  if (items.length === 0) {
    return (
      <div
        className="font-body min-h-[60vh] flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: '#FAF6F0', color: '#4A3025' }}
      >
        <h1 className="font-display text-4xl mb-4" style={{ color: '#4A3025' }}>
          Your Archive is Empty
        </h1>
        <p className="text-sm mb-8 max-w-md" style={{ color: '#8A817C' }}>
          Your selection awaits. Discover our collection of handcrafted Indian ethnic wear.
        </p>
        <Link
          href="/shop"
          className="inline-block px-12 py-4 text-[10px] uppercase tracking-[0.2em] transition-colors"
          style={{ backgroundColor: '#4A3025', color: '#FAF6F0' }}
        >
          Explore The Edit
        </Link>
      </div>
    );
  }

  return (
    <div className="font-body" style={{ backgroundColor: '#FAF6F0', color: '#4A3025' }}>
      {/* Header */}
      <div
        className="px-6 md:px-12 lg:px-24"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '40px',
          paddingBottom: '40px',
          marginBottom: '64px',
          borderBottom: '1px solid #E5DFD5',
        }}
      >
        <h1 className="font-display text-3xl md:text-4xl" style={{ color: '#4A3025' }}>
          The Heritage Selection
        </h1>
        <span
          className="text-[10px] uppercase tracking-[0.2em] mb-2 hidden md:block"
          style={{ color: '#8A817C' }}
        >
          {itemCount} {itemCount === 1 ? 'Artisanal Piece' : 'Artisanal Pieces'}
        </span>
      </div>

      <div
        className="px-6 md:px-12 lg:px-24"
        style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '128px' }}
      >
        <div className="flex flex-col lg:flex-row" style={{ gap: '64px' }}>
          {/* Left — Items */}
          <div className="lg:w-2/3">
            <div className="space-y-12">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex flex-col md:flex-row"
                  style={{
                    gap: '48px',
                    paddingBottom: '64px',
                    marginBottom: '64px',
                    borderBottom: '1px solid #E5DFD5',
                  }}
                >
                  {/* Image */}
                  <div
                    className="w-full md:w-1/3 aspect-[4/5] relative p-2 shrink-0"
                    style={{ border: '1px solid #E5DFD5', backgroundColor: '#FAF8F5' }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={item.image || generatePlaceholderImage(300, 400, item.productId)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="w-full md:w-2/3 flex flex-col justify-between">
                    <div>
                      <span
                        className="text-[10px] uppercase tracking-[0.2em] mb-2 block"
                        style={{ color: '#8A817C' }}
                      >
                        The Archives
                      </span>
                      <Link
                        href={`/shop/${item.slug}`}
                        className="font-display text-3xl hover:opacity-70 transition-opacity mb-4 block"
                        style={{ color: '#4A3025' }}
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm leading-relaxed mb-6" style={{ color: '#8A817C' }}>
                        Hand-spun organic silk in deep umber, featuring subtle zari thread work
                        inspired by 1920s Malabar Hill aesthetics.
                      </p>

                      <div className="flex gap-4 mb-8">
                        <span
                          className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5"
                          style={{ border: '1px solid #E5DFD5', color: '#8A817C' }}
                        >
                          Size: {item.size}
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5"
                          style={{ border: '1px solid #E5DFD5', color: '#8A817C' }}
                        >
                          Color: {item.colour}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-6">
                        <div
                          className="flex items-center gap-4 text-xs font-body pb-1"
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
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity"
                          style={{ color: '#7d3f3f' }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="font-display text-2xl" style={{ color: '#4A3025' }}>
                        {format(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="lg:w-1/3 space-y-8 lg:sticky lg:self-start" style={{ top: '120px' }}>
            {/* Gift Dossier */}
            <div
              style={{ padding: '48px', border: '1px solid #E5DFD5', backgroundColor: '#FAF8F5' }}
            >
              <h2
                className="font-display text-2xl mb-4 flex items-center gap-3"
                style={{ color: '#4A3025' }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
                Gift Dossier
              </h2>
              <div className="w-full h-px my-6" style={{ backgroundColor: '#E5DFD5' }} />
              <p className="text-xs leading-relaxed mb-6" style={{ color: '#8A817C' }}>
                Elevate your selection with our signature botanical packaging and a personalized
                handwritten note.
              </p>

              <label className="flex items-start gap-3 cursor-pointer group mb-4">
                <div
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ border: '1px solid #E5DFD5' }}
                />
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.1em] mb-1"
                    style={{ color: '#4A3025' }}
                  >
                    Add Signature Packaging (₹1,500)
                  </p>
                  <p className="text-xs" style={{ color: '#8A817C' }}>
                    Includes a bespoke fragrance card and vintage ribbon.
                  </p>
                </div>
              </label>

              <button
                className="text-[10px] uppercase tracking-[0.2em] pb-0.5 transition-colors"
                style={{ color: '#8A817C', borderBottom: '1px solid #E5DFD5' }}
              >
                Handwritten Note (Optional)
              </button>
            </div>

            {/* Summary */}
            <div
              style={{
                padding: '48px',
                border: '1px solid #E5DFD5',
                backgroundColor: '#FAF8F5',
                marginTop: '32px',
              }}
            >
              <h2 className="font-display text-2xl mb-6" style={{ color: '#4A3025' }}>
                Summary
              </h2>
              <div
                className="space-y-4 text-xs font-body pb-6 mb-6"
                style={{ borderBottom: '1px solid #E5DFD5' }}
              >
                <div className="flex justify-between">
                  <span style={{ color: '#8A817C' }}>Subtotal</span>
                  <span style={{ color: '#4A3025' }}>{format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#8A817C' }}>Shipping</span>
                  <span style={{ color: '#4A3025' }}>Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#8A817C' }}>Taxes (Estimated)</span>
                  <span style={{ color: '#4A3025' }}>{format(subtotal * 0.05)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-8">
                <span
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: '#8A817C' }}
                >
                  Total
                </span>
                <span className="font-display text-4xl" style={{ color: '#4A3025' }}>
                  {format(subtotal * 1.05)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="block w-full text-center py-4 text-[10px] uppercase tracking-[0.2em] transition-colors"
                style={{ backgroundColor: '#4A3025', color: '#FAF6F0' }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      <div
        className="px-6 md:px-12 lg:px-24"
        style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '128px', marginTop: '64px' }}
      >
        <div
          className="flex justify-between items-end"
          style={{ paddingBottom: '24px', marginBottom: '64px', borderBottom: '1px solid #E5DFD5' }}
        >
          <h2 className="font-display text-3xl" style={{ color: '#4A3025' }}>
            You May Also Like
          </h2>
          <Link
            href="/shop"
            className="text-[10px] uppercase tracking-[0.2em] transition-colors hidden md:block"
            style={{ color: '#8A817C' }}
          >
            Explore Archives
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
