'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/types/product';
import { formatPrice } from '@/frontend/utils/formatters';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  // Format badge text
  const badgeText = product.isNewArrival
    ? 'New In'
    : product.isBestseller
    ? 'Bestseller'
    : null;

  return (
    <div
      className="group flex flex-col relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickAdd(false);
      }}
    >
      {/* Image Container (3:4 Aspect Ratio, Rounded) */}
      <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden bg-border-light">
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
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 33vw"
            className={`object-cover transition-opacity duration-normal ${
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
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 33vw"
              className={`object-cover absolute inset-0 transition-opacity duration-normal hidden md:block ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              unoptimized
            />
          )}
        </Link>

        {/* Badge (Top Left) */}
        {badgeText && (
          <div 
            className="absolute top-4 left-4 bg-chalk text-brass text-[10px] uppercase rounded-full font-medium z-10 shadow-sm text-center"
            style={{ padding: '6px 16px', letterSpacing: '0.1em', textIndent: '0.1em' }}
          >
            {badgeText}
          </div>
        )}

        {/* Bookmark/Wishlist Button (Top Right) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 z-10 p-1 drop-shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? (
            <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor" className="text-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 23L10 16.5L19 23V3C19 2.46957 18.7893 1.96086 18.4142 1.58579C18.0391 1.21071 17.5304 1 17 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V23Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="text-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 23L10 16.5L1 23V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H17C17.5304 1 18.0391 1.21071 18.4142 1.58579C18.7893 1.96086 19 2.46957 19 3V23Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>

        {/* Mock Carousel Dots */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm" />
          </div>
        )}
      </div>

      {/* Details Area */}
      <div 
        className="flex flex-col items-center text-center w-full"
        style={{ marginTop: '24px', paddingLeft: '12px', paddingRight: '12px' }}
      >
        <div className="flex flex-col items-center gap-2">
          <Link 
            href={`/product/${product.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass rounded-sm"
          >
            <p className="text-[15px] font-semibold text-ink hover:text-brass transition-colors leading-tight font-body text-center">
              {product.name}
            </p>
          </Link>
          
          <div className="flex items-center justify-center gap-2">
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <>
                <span className="text-text-muted text-[13px] line-through font-body">
                  ({formatPrice(product.compareAtPrice).replace('₹', 'Rs. ')})
                </span>
                <span className="text-sindoor text-[13px] font-medium font-body">
                  ({formatPrice(product.price).replace('₹', 'Rs. ')})
                </span>
              </>
            ) : (
              <span className="text-text-muted text-[13px] font-medium font-body">
                ({formatPrice(product.price).replace('₹', 'Rs. ')})
              </span>
            )}
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="flex-shrink-0 flex items-center justify-center gap-1.5 bg-white border border-border/80 rounded-full text-ink text-[13px] font-medium hover:bg-chalk transition-colors shadow-sm"
          style={{ padding: '6px 16px', marginTop: '16px' }}
          aria-label="Quick Add"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Quick Add
        </button>
      </div>
      
      {/* Quick Add Overlay Details (Optional: Can stay or be modified) */}
      {showQuickAdd && (
        <div 
          className="absolute inset-x-2 bottom-16 bg-white/95 backdrop-blur-md rounded-[16px] flex flex-col z-20 shadow-lg border border-border/50 animate-fade-in-up"
          style={{ padding: '16px' }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
            <span className="text-xs uppercase tracking-widest font-medium">Select Size</span>
            <button 
              onClick={() => setShowQuickAdd(false)}
              className="text-text-muted hover:text-ink transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1L11 11M11 1L1 11" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap" style={{ gap: '8px' }}>
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
              const isAvailable = (product.stockBySize as any)[size] > 0;
              return (
                <button
                  key={size}
                  disabled={!isAvailable}
                  className={`flex-1 min-w-[36px] h-8 text-[11px] font-medium uppercase border flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
                    isAvailable 
                      ? 'border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-chalk cursor-pointer' 
                      : 'border-border text-text-muted/50 cursor-not-allowed line-through'
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
  );
}
