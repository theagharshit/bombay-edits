'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchProducts } from '@/data/products';
import { ProductCard } from '@/frontend/components/v2/product/ProductCard';
import Link from 'next/link';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = query ? searchProducts(query) : [];

  return (
    <div className="container-site section-padding font-body">
      <h1 className="font-display text-3xl text-ink mb-2">Search results</h1>
      {query && (
        <p className="text-sm text-text-muted mb-8">Showing results for &ldquo;{query}&rdquo;</p>
      )}

      {!query ? (
        <p className="text-sm text-text-muted">Enter a search term to find products.</p>
      ) : results.length === 0 ? (
        <div className="text-center py-16 bg-cream rounded-none">
          <p className="font-display text-xl text-ink mb-2">No results found</p>
          <p className="text-sm text-text-muted mb-6">
            Try a different search term or browse our collections.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-ink text-ivory px-8 py-3 text-sm font-body rounded-none hover:bg-deep-brown transition-colors"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-site section-padding">
          <div className="h-96 skeleton rounded-none" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
