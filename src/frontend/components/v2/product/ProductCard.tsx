'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, Size } from '@/types/product';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
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
  };

  return (
    <div
      className="group flex flex-col relative w-full select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container (2:3 Editorial Portrait Aspect Ratio) */}
      <div className="relative aspect-[2/3] w-full rounded-none overflow-hidden bg-[#F7F5F0]">
        {/* Clicking anywhere on the image container navigates to the product page */}
        <Link
          href={`/product/${product.slug}`}
          className="relative block w-full h-full cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          aria-label={`View ${product.name}`}
        >
          {/* Single Primary Image (No hover switch) */}
          <Image
            src={product.images[0]?.src || ''}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 340px"
            className="object-cover object-top transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] pointer-events-none"
            priority={priority}
            unoptimized
          />
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

        {/* Wishlist / Save Button (Top Right) with card-hover reveal and smooth tactile button hover */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full border backdrop-blur-md flex items-center justify-center transition-all duration-300 ease-out shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass cursor-pointer select-none ${
            wishlisted
              ? 'opacity-100 bg-[#FAF2F0] text-[var(--color-wine)] border-[var(--color-wine)]/40 hover:bg-[var(--color-wine)] hover:text-white hover:border-[var(--color-wine)] active:scale-95'
              : `${
                  isHovered ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
                } bg-white/90 text-[var(--color-deep-brown)] border-[#DED8CF] hover:bg-[var(--color-deep-brown)] hover:text-[#FAF5EE] hover:border-[var(--color-deep-brown)] active:scale-95`
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
            className="pointer-events-none select-none"
          >
            <path d="M19 23L10 16.5L1 23V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H17C17.5304 1 18.0391 1.21071 18.4142 1.58579C18.7893 1.96086 19 2.46957 19 3V23Z" />
          </svg>
        </button>

        {/* Bottom Details: Name & Money permanent beside each other; Size Selector below */}
        <div
          className="absolute inset-x-0 bottom-0 z-20 bg-[#FAF7F2]/90 md:bg-white/85 backdrop-blur-md border-t border-white/80 px-3.5 py-2.5 transition-colors duration-500 ease-out select-none flex flex-col justify-center min-h-[64px] gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Row 1: Product Name (Left) + Money / Price (Right beside it) — Permanent, never disappears */}
          <div className="flex items-baseline justify-between gap-2 w-full">
            <Link
              href={`/product/${product.slug}`}
              className="block truncate cursor-pointer select-none text-left focus-visible:outline-none flex-1 min-w-0"
              aria-label={`View ${product.name}`}
            >
              <h3 className="text-[12px] font-normal uppercase tracking-[0.16em] text-[var(--color-deep-brown)] font-body truncate leading-snug hover:text-[var(--color-wine)] transition-colors pointer-events-none select-none">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-baseline gap-1.5 shrink-0 select-none pointer-events-none text-right font-body">
              <span className="text-[12px] font-medium text-[var(--color-deep-brown)] tracking-tight">
                Rs.{' '}
                {product.price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[10px] text-[var(--color-muted)] line-through">
                  Rs.{' '}
                  {product.compareAtPrice.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Size Selector Below — Unhovered label crossfading into interactive size buttons on hover */}
          <div className="relative h-7 w-full overflow-hidden">
            {/* Unhovered (Desktop): Discreet Sizing Label */}
            <div
              className={`hidden md:flex absolute inset-0 items-center justify-between text-left font-body transition-opacity duration-300 ease-out pointer-events-none select-none ${
                isHovered ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
              }`}
            >
              <span className="text-[9.5px] uppercase tracking-[0.18em] text-[var(--color-muted)] font-body">
                Select Size
              </span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[var(--color-deep-brown)]/60 font-body">
                XS – XXL
              </span>
            </div>

            {/* Hovered (Desktop) & Default (Mobile): Interactive Size Buttons */}
            <div
              className={`flex absolute inset-0 items-center justify-between gap-1 transition-opacity duration-300 ease-out select-none ${
                isHovered
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-100 md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto'
              }`}
            >
              {SIZES.map((size) => {
                const isAvailable = (product.stockBySize?.[size] ?? 1) > 0;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!isAvailable}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickAdd(size);
                    }}
                    className={`flex-1 h-7 text-[10px] font-medium font-body uppercase border flex items-center justify-center transition-colors duration-200 ease-out select-none ${
                      isAvailable
                        ? 'border-[#DED8CF] text-[var(--color-deep-brown)] bg-white/95 hover:bg-[var(--color-deep-brown)] hover:text-[#FAF5EE] hover:border-[var(--color-deep-brown)] active:scale-95 cursor-pointer'
                        : 'border-black/5 text-[#A8A29E]/40 cursor-not-allowed line-through bg-black/[0.02]'
                    }`}
                    aria-label={`Add size ${size}`}
                    title={isAvailable ? `Add size ${size}` : `Size ${size} unavailable`}
                  >
                    <span className="pointer-events-none select-none tracking-wider font-semibold">
                      {size}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
