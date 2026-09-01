'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCurrency } from '@/context/CurrencyContext';
import { getProductPlaceholder } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  showQuickAdd?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { format } = useCurrency();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const frontImage = product.images.find(img => img.type === 'front')?.src
    || getProductPlaceholder('front', product.slug);
  const backImage = product.images.find(img => img.type === 'back' || img.type === 'lifestyle')?.src
    || getProductPlaceholder('back', product.slug);

  return (
    <div className="group relative">
      {/* Image container with hover swap */}
      <Link href={`/shop/${product.slug}`} className="block product-image-hover aspect-[3/4] bg-cream relative overflow-hidden">
        <Image
          src={frontImage}
          alt={product.name}
          width={600}
          height={800}
          className="w-full h-full object-cover"
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <Image
          src={backImage}
          alt={`${product.name} back view`}
          width={600}
          height={800}
          className="w-full h-full object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="text-ink border border-ink/20 bg-ivory/50 backdrop-blur-sm text-[9px] uppercase tracking-widest font-medium px-2 py-1">
              New
            </span>
          )}
          {product.isMadeToOrder && (
            <span className="text-ink border border-ink/20 bg-ivory/50 backdrop-blur-sm text-[9px] uppercase tracking-widest font-medium px-2 py-1">
              Made to order
            </span>
          )}
          {product.compareAtPrice && (
            <span className="text-ink border border-ink/20 bg-ivory/50 backdrop-blur-sm text-[9px] uppercase tracking-widest font-medium px-2 py-1">
              Sale
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
          wishlisted ? 'bg-ivory text-wine' : 'bg-ivory/70 text-deep-brown opacity-0 group-hover:opacity-100'
        }`}
        style={{ transitionDuration: 'var(--duration-normal)' }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <Link href={`/shop/${product.slug}`} className="block">
          <h3 className="text-xs uppercase tracking-widest font-medium text-ink truncate mb-1">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-body text-chocolate">{format(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-[10px] text-text-muted line-through">{format(product.compareAtPrice)}</span>
          )}
        </div>

        {/* Colour swatch */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <span
            className="w-3 h-3 rounded-full border border-border"
            style={{ backgroundColor: product.colour.hex }}
            title={product.colour.name}
          />
          <span className="text-xs text-text-muted">{product.colour.name}</span>
        </div>
      </div>
    </div>
  );
}
