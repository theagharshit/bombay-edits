'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { products } from '@/data/products';
import { ProductCard } from '@/frontend/components/v2/product/ProductCard';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();
  const wishlistProducts = items
    .map((item) => products.find((p) => p.id === item.productId))
    .filter(Boolean);

  return (
    <div className="container-site section-padding font-body">
      <div className="flex items-center justify-between border-b border-beige-line pb-6 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-1">Your Wishlist</h1>
          <p className="text-sm text-text-muted font-body">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs uppercase tracking-widest text-text-muted hover:text-ink transition-colors font-medium cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 bg-cream rounded-none">
          <p className="font-display text-xl text-ink mb-2">Your wishlist is empty</p>
          <p className="text-sm text-text-muted mb-6">
            Save items you love by clicking the heart icon on any piece.
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {wishlistProducts.map(
            (product) => product && <ProductCard key={product.id} product={product} />
          )}
        </div>
      )}
    </div>
  );
}
