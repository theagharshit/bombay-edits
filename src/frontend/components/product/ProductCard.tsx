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
      }}
    >
      {/* Image Container (2:3 Portrait Aspect Ratio, Large & Immersive) */}
      <div className="relative aspect-[2/3] w-full rounded-[3px] overflow-hidden bg-[#F7F5F0]">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          tabIndex={-1}
        >
          {/* Primary Image */}
          <Image
            src={product.images[0]?.src || ''}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover object-top absolute inset-0 transition-opacity duration-500 hidden md:block ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              unoptimized
            />
          )}
        </Link>

        {/* Badge (Top Left) — Chic Rounded Pill */}
        {badgeText && (
          <span className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md text-[9.5px] uppercase tracking-[0.16em] font-medium font-body text-[var(--color-ink)] px-2.5 py-1 rounded-full shadow-2xs select-none pointer-events-none">
            {badgeText}
          </span>
        )}

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[var(--color-ink)] hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass cursor-pointer"
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

        {/* Size Selection Overlay (Clean slide-up overlay inside image) */}
        {showQuickAdd && (
          <div
            className="absolute inset-x-0 bottom-0 z-20 bg-[var(--color-ivory)]/95 backdrop-blur-md p-3 border-t border-[var(--color-line)] flex flex-col gap-2 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.16em] font-medium font-body text-[var(--color-ink)]/70">
                Select Size
              </span>
              <button
                onClick={() => setShowQuickAdd(false)}
                className="text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] transition-colors p-1 cursor-pointer"
                aria-label="Close size selector"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((size) => {
                const isAvailable = (product.stockBySize?.[size] ?? 1) > 0;
                return (
                  <button
                    key={size}
                    disabled={!isAvailable}
                    onClick={() => handleQuickAdd(size)}
                    className={`flex-1 min-w-[32px] h-7 text-[10.5px] font-medium font-body uppercase border flex items-center justify-center transition-all ${
                      isAvailable
                        ? 'border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] hover:border-[var(--color-ink)] active:scale-95 cursor-pointer'
                        : 'border-[var(--color-line)]/40 text-[var(--color-muted)]/40 cursor-not-allowed line-through'
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

      {/* Details Area — Refined, Airy, Editorial Layout */}
      <div className="mt-3 px-1 flex flex-col gap-1.5">
        <Link
          href={`/product/${product.slug}`}
          className="block group/title focus-visible:outline-none"
        >
          <h3 className="text-[13.5px] font-normal text-[var(--color-ink)] font-body truncate leading-snug group-hover/title:opacity-75 transition-opacity">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-[12.5px] font-medium text-[var(--color-ink)] font-body tracking-tight">
              {formatPrice(product.price).replace('₹', 'Rs. ')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-[var(--color-muted)] line-through font-body">
                {formatPrice(product.compareAtPrice).replace('₹', 'Rs. ')}
              </span>
            )}
          </div>

          {/* Nishorama-Style + Add Pill Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowQuickAdd(!showQuickAdd);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] uppercase tracking-[0.1em] font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none cursor-pointer ${
              showQuickAdd
                ? 'bg-[var(--color-ink)] text-[var(--color-ivory)] border-[var(--color-ink)]'
                : 'border-[var(--color-line)] bg-white/70 text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] hover:border-[var(--color-ink)] shadow-2xs'
            }`}
            aria-label={`Quick add ${product.name}`}
          >
            <svg
              width="9"
              height="9"
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
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
