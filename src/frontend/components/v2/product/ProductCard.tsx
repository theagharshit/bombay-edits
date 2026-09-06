'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Size } from '@/types/product';
import { formatPrice } from '@/frontend/utils/formatters';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addItem, openCart } = useCart();
  const wishlisted = isWishlisted(product.id);

  // Format badge text
  const badgeText = product.isNewArrival ? 'New In' : product.isBestseller ? 'Bestseller' : null;

  const handleQuickAdd = (size: string) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src || '',
      colour: product.colour?.name || 'Standard',
      size: size,
      quantity: 1,
      maxQuantity: 5,
    });
    openCart();
    setShowQuickAdd(false);
  };

  return (
    <div
      className="group flex flex-col relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
    >
      {/* Image Container (2:3 Editorial Portrait Aspect Ratio, Large & Immersive) */}
      <div className="relative aspect-[2/3] w-full rounded-none overflow-hidden bg-[#F7F5F0]">
        <Link
          href={`/product/${product.slug}`}
          className="relative block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          tabIndex={-1}
        >
          {/* Primary Image */}
          <Image
            src={product.images[0]?.src || ''}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 340px"
            className={`object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
              isHovered && product.images.length > 1 ? 'opacity-0 hidden md:block' : 'opacity-100'
            }`}
            priority={priority}
            unoptimized
          />

          {/* Secondary Image (Hover Crossfade on Desktop) */}
          {product.images.length > 1 && (
            <Image
              src={product.images[1]?.src || ''}
              alt={product.images[1]?.alt || product.name}
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 340px"
              className={`object-cover object-top absolute inset-0 transition-opacity duration-500 hidden md:block ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              unoptimized
            />
          )}
        </Link>

        {/* Badge (Top Left) — Pointed Luxury Tag */}
        {badgeText && (
          <span
            className={`absolute top-3 left-3 z-10 text-[9.5px] uppercase tracking-[0.16em] font-medium font-body px-2.5 py-1 rounded-none shadow-2xs select-none pointer-events-none border backdrop-blur-md transition-colors ${
              product.isNewArrival
                ? 'bg-[#FAF2F0]/95 text-[#641C2E] border-[#DEB5AC]/60'
                : product.isBestseller
                  ? 'bg-[#EDF2EE]/95 text-[#3D523F] border-[#CAD8CC]/70'
                  : 'bg-[#F9F4EB]/95 text-[#7A5B28] border-[#DFD1B8]/80'
            }`}
          >
            {badgeText}
          </span>
        )}

        {/* Wishlist / Save Button (Top Right) with Translucent Background & Rounded Border */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full border backdrop-blur-md flex items-center justify-center transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass cursor-pointer ${
            wishlisted
              ? 'bg-[#FAF2F0]/50 text-[var(--color-wine)] border-[var(--color-wine)]/40 hover:scale-110 active:scale-95'
              : 'bg-white/40 text-[var(--color-deep-brown)] border-white/60 hover:bg-white/60 hover:border-[var(--color-wine)]/40 hover:text-[var(--color-wine)] hover:scale-110 active:scale-95'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            width="14"
            height="17"
            viewBox="0 0 20 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 23L10 16.5L1 23V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H17C17.5304 1 18.0391 1.21071 18.4142 1.58579C18.7893 1.96086 19 2.46957 19 3V23Z" />
          </svg>
        </button>

        {/* Details & Quick-Add Popup Overlay (Translucent frosted glass matching the save icon) */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-white/40 backdrop-blur-md px-3.5 py-3 border-t border-white/60 rounded-none shadow-lg transition-all duration-300 ease-out flex flex-col items-start text-left gap-1.5 ${
            isHovered || showQuickAdd
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Product Name (12px, All-Caps, Tracked, Left-Aligned) */}
          <Link
            href={`/product/${product.slug}`}
            className="block group/title focus-visible:outline-none w-full text-left"
          >
            <h3
              className="text-[12px] !text-[12px] font-normal uppercase tracking-[0.18em] text-[var(--color-deep-brown)] font-body truncate leading-snug group-hover/title:text-[var(--color-wine)] transition-colors text-left"
              style={{ fontSize: '12px' }}
            >
              {product.name}
            </h3>
          </Link>

          {/* Price & Add Button Row (Left-aligned price, right-aligned add button) */}
          <div className="flex items-center justify-between w-full gap-2 font-body">
            <div className="flex items-baseline gap-1.5 text-left">
              <span
                className="text-[12px] !text-[12px] font-normal text-[var(--color-deep-brown)] tracking-wide"
                style={{ fontSize: '12px' }}
              >
                Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[11px] text-[var(--color-muted)] line-through">
                  Rs. {product.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {/* + Add Button (Translucent styling matching save icon) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickAdd(!showQuickAdd);
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none border text-[10px] uppercase tracking-[0.14em] font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none cursor-pointer shrink-0 ${
                showQuickAdd
                  ? 'bg-[var(--color-deep-brown)]/85 text-[var(--color-champagne-light)] border-[var(--color-deep-brown)]'
                  : 'border-white/60 bg-white/40 text-[var(--color-deep-brown)] hover:bg-white/65 hover:text-[var(--color-wine)] hover:border-[var(--color-wine)]/40 shadow-2xs'
              }`}
              aria-label={`Quick add ${product.name}`}
            >
              <svg
                width="8"
                height="8"
                viewBox="0 0 10 10"
                fill="currentColor"
                className={`transition-transform duration-200 ${showQuickAdd ? 'rotate-45' : ''}`}
              >
                <path
                  fillRule="evenodd"
                  d="M5 1a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 5 1z"
                  clipRule="evenodd"
                />
              </svg>
              {showQuickAdd ? 'Close' : 'Add'}
            </button>
          </div>

          {/* Size Selection Area (Revealed when + Add is clicked) */}
          {showQuickAdd && (
            <div className="w-full pt-2 border-t border-white/50 flex flex-col gap-1.5 animate-in fade-in duration-200">
              <span className="text-[9.5px] uppercase tracking-[0.16em] font-medium font-body text-[var(--color-deep-brown)]/80 text-left">
                Select Size
              </span>
              <div className="flex flex-wrap gap-1">
                {SIZES.map((size) => {
                  const isAvailable = (product.stockBySize?.[size] ?? 1) > 0;
                  return (
                    <button
                      key={size}
                      disabled={!isAvailable}
                      onClick={() => handleQuickAdd(size)}
                      className={`flex-1 min-w-[28px] h-6 text-[10px] font-medium font-body uppercase border flex items-center justify-center transition-all rounded-none ${
                        isAvailable
                          ? 'border-white/60 text-[var(--color-deep-brown)] bg-white/50 hover:bg-white/80 hover:text-[var(--color-wine)] hover:border-[var(--color-wine)]/40 active:scale-95 cursor-pointer'
                          : 'border-white/30 text-[var(--color-muted)]/40 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
