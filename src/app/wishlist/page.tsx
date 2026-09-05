'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { products } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();
  const wishlistProducts = items
    .map((item) => products.find((p) => p.id === item.productId))
    .filter(Boolean);

  return (
    <div className="container-site section-padding">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Wishlist</h1>
          <p className="text-sm text-text-muted mt-1">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'piece' : 'pieces'} saved
          </p>
        </div>
        {wishlistProducts.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs font-body text-text-muted hover:text-wine underline transition-colors"
            style={{ transitionDuration: 'var(--duration-fast)' }}
          >
            Clear all
          </button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-beige mx-auto mb-4"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="font-display text-xl text-ink mb-2">Your wishlist is empty</p>
          <p className="text-sm text-text-muted mb-6">
            Browse our collection and save pieces you love.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-ink text-ivory px-8 py-3 text-sm font-body rounded-none hover:bg-deep-brown transition-colors"
            style={{ transitionDuration: 'var(--duration-fast)' }}
          >
            Explore the collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8">
          {wishlistProducts.map(
            (product) => product && <ProductCard key={product.id} product={product} />
          )}
        </div>
      )}
    </div>
  );
}
