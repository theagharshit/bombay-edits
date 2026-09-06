'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { SizeGuideModal } from './SizeGuideModal';
import { ProductCard } from '@/frontend/components/product/ProductCard';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailContent({ product, relatedProducts }: Props) {
  // Cart & Wishlist context
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  // Interaction States
  const [selectedSize, setSelectedSize] = useState<string>(
    product.availableSizes?.[0] || 'S'
  );
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>({
    name: product.colour?.name || 'Ivory Gold',
    hex: product.colour?.hex || '#DFD1B8',
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isMoreDetailOpen, setIsMoreDetailOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Recommended products carousel ref for Previous/Next
  const railRef = useRef<HTMLDivElement>(null);

  // Curated Color palette options for garment swatches
  const availableColors = [
    { name: product.colour?.name || 'Ivory Gold', hex: product.colour?.hex || '#DFD1B8' },
    { name: 'Warm Cream', hex: '#F5EFEB' },
    { name: 'Heritage Wine', hex: '#641C2E' },
    { name: 'Deep Espresso', hex: '#3A241A' },
  ];

  // Guaranteed 5-image editorial gallery (1 large hero + 2x2 grid)
  const baseImages = product.images.length > 0
    ? product.images.map((img) => img.src)
    : [
        '/images/products/placeholder-1.jpg',
        '/images/products/placeholder-2.jpg',
        '/images/products/placeholder-3.jpg',
        '/images/products/placeholder-4.jpg',
      ];

  // Fill up to 5 distinct images for full layout
  const galleryImages: string[] = [
    baseImages[0] || '/images/products/placeholder-1.jpg',
    baseImages[1] || baseImages[0],
    baseImages[2] || baseImages[1] || baseImages[0],
    baseImages[3] || baseImages[0],
    baseImages[4] || baseImages[1] || baseImages[0],
  ];

  // Complete The Look pairings (2 items from related products)
  const completeTheLookItems = relatedProducts.slice(0, 2);

  // Recommended Products (next 4-6 items)
  const recommendedItems = relatedProducts.length > 2
    ? relatedProducts.slice(2, 6)
    : relatedProducts;

  // Handle Add to Cart
  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: galleryImages[0],
      colour: selectedColor.name,
      size: selectedSize,
      quantity: 1,
      maxQuantity: 5,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Carousel scroll controls
  const scrollRail = (direction: 'prev' | 'next') => {
    if (railRef.current) {
      const scrollAmount = direction === 'next' ? 320 : -320;
      railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Standard sizes list
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="bg-[var(--color-ivory)] text-[var(--color-deep-brown)] font-body min-h-screen pt-28 pb-20 selection:bg-[var(--color-wine)]/10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* ─── 1. Breadcrumbs (Subtle, uppercase, tracked) ─────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-[var(--color-muted)] mb-8"
        >
          <Link href="/" className="hover:text-[var(--color-deep-brown)] transition-colors">
            Home Page
          </Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-[var(--color-deep-brown)] transition-colors">
            Clothing
          </Link>
          <span>&gt;</span>
          <Link
            href={`/category/${product.category}`}
            className="hover:text-[var(--color-deep-brown)] transition-colors"
          >
            {product.category.replace(/-/g, ' ')}
          </Link>
          <span>&gt;</span>
          <span className="text-[var(--color-deep-brown)] truncate max-w-[200px] md:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* ─── 2. Main Product Section (2-Column Reference Split) ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-24">
          {/* ──── LEFT COLUMN: Editorial Gallery (1 Hero + 2x2 Grid) ─────────────── */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Main Hero Photo */}
            <div className="relative w-full aspect-[3/4] bg-[var(--color-cream)]/40 overflow-hidden rounded-none border border-[var(--color-line)]/50 group">
              <Image
                src={galleryImages[activeImageIndex]}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />

              {/* Promotional Badge (e.g., 25% off / Made to order) */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 bg-white/70 backdrop-blur-md text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-deep-brown)] border border-white/60 rounded-none shadow-2xs">
                  {product.compareAtPrice && product.compareAtPrice > product.price
                    ? `${Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off`
                    : product.isMadeToOrder
                    ? 'Bespoke Order'
                    : 'Handcrafted'}
                </span>
              </div>
            </div>

            {/* 2x2 Secondary Image Grid Directly Below Hero */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {galleryImages.slice(1, 5).map((imgSrc, idx) => {
                const imgIndex = idx + 1;
                const isActive = activeImageIndex === imgIndex;
                return (
                  <button
                    key={`thumb-${imgIndex}`}
                    onClick={() => setActiveImageIndex(imgIndex)}
                    className={`relative aspect-[3/4] w-full bg-[var(--color-cream)]/40 overflow-hidden rounded-none border transition-all duration-200 cursor-pointer group text-left ${
                      isActive
                        ? 'border-[var(--color-deep-brown)] ring-1 ring-[var(--color-deep-brown)]'
                        : 'border-[var(--color-line)]/60 hover:border-[var(--color-wine)]/60'
                    }`}
                    aria-label={`View photo ${imgIndex + 1}`}
                  >
                    <Image
                      src={imgSrc}
                      alt={`${product.name} lookbook detail ${imgIndex}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 28vw"
                    />
                    {/* Subtle index badge */}
                    <span className="absolute bottom-2 right-2 bg-white/60 backdrop-blur-xs text-[9px] px-1.5 py-0.5 text-[var(--color-deep-brown)] font-body">
                      0{imgIndex + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ──── RIGHT COLUMN: Product Info & Actions (Sticky) ─────────────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col gap-5 text-left">
            {/* Title & Price Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)]/50 pb-5">
              <div className="flex flex-col gap-1.5 flex-1">
                <h1 className="font-display text-2xl md:text-3xl uppercase tracking-[0.12em] text-[var(--color-deep-brown)] leading-snug">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)] font-body">
                  <span className="text-[var(--color-gold)] tracking-widest text-sm">★★★★★</span>
                  <span className="text-[11px] tracking-wider text-[var(--color-deep-brown)]/80">
                    18 Reviews
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col items-end shrink-0 font-body">
                <span className="text-xl md:text-2xl font-normal text-[var(--color-deep-brown)] tracking-wide">
                  Rs. {product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xs text-[var(--color-muted)] line-through">
                    Rs. {product.compareAtPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* Color Selector */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] font-medium">
                <span className="text-[var(--color-muted)]">Color</span>
                <span className="text-[var(--color-deep-brown)] font-semibold">
                  {selectedColor.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {availableColors.map((col) => {
                  const isSelected = selectedColor.name === col.name;
                  return (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col)}
                      className={`relative w-6 h-6 rounded-full transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-[var(--color-deep-brown)] scale-110'
                          : 'hover:scale-105 border border-black/10'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      aria-label={`Select color ${col.name}`}
                      title={col.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selector & Size Guide Link */}
            <div className="flex flex-col gap-2.5 mt-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] font-medium">
                <span className="text-[var(--color-muted)]">Size</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[var(--color-deep-brown)] hover:text-[var(--color-wine)] underline underline-offset-4 decoration-[var(--color-line)] transition-colors cursor-pointer text-[10.5px]"
                >
                  Size Guide
                </button>
              </div>

              {/* Size Buttons Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {sizes.map((s) => {
                  const isAvailable = product.availableSizes?.includes(s as any) ?? true;
                  const isSelected = selectedSize === s;
                  return (
                    <button
                      key={s}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(s)}
                      className={`h-10 text-[11px] font-medium font-body uppercase border rounded-none flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-deep-brown)] text-[var(--color-champagne-light)] border-[var(--color-deep-brown)]'
                          : isAvailable
                          ? 'border-[var(--color-line)] text-[var(--color-deep-brown)] bg-white/40 hover:border-[var(--color-deep-brown)] hover:bg-white/80 active:scale-95'
                          : 'border-[var(--color-line)]/40 text-[var(--color-muted)]/40 cursor-not-allowed line-through bg-transparent'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Buttons (Side by Side) */}
            <div className="flex items-center gap-3 mt-3">
              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-[var(--color-deep-brown)] text-[var(--color-champagne-light)] hover:bg-[var(--color-wine)] py-3.5 px-4 text-[11px] uppercase tracking-[0.18em] font-medium transition-all duration-200 active:scale-98 rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                {addedToCart ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                    Added To Bag
                  </>
                ) : (
                  'Add To Cart'
                )}
              </button>

              {/* Add to Wishlist Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 border py-3.5 px-4 text-[11px] uppercase tracking-[0.18em] font-medium transition-all duration-200 active:scale-98 rounded-none cursor-pointer flex items-center justify-center gap-2 ${
                  wishlisted
                    ? 'border-[var(--color-wine)] text-[var(--color-wine)] bg-[var(--color-wine-light)]'
                    : 'border-[var(--color-deep-brown)]/50 text-[var(--color-deep-brown)] hover:border-[var(--color-wine)] hover:text-[var(--color-wine)] bg-transparent'
                }`}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill={wishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {wishlisted ? 'In Wishlist' : 'Add To Wishlist'}
              </button>
            </div>

            {/* Editorial Tagline & Narrative Description */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[var(--color-line)]/50">
              <p className="font-display italic text-lg md:text-xl text-[var(--color-wine)]/90 leading-snug">
                {product.shortDescription || 'A handcrafted architectural silhouette tailored in heritage textiles.'}
              </p>
              <p className="font-body text-xs leading-relaxed text-[var(--color-muted)]">
                {product.longDescription ||
                  `To wear ${product.name} is to experience master artistry in motion. Crafted by seasoned generational weavers, this piece combines structural poise with comfortable contemporary ease.`}
              </p>
            </div>

            {/* Specifications Key-Value Table (Model, Materials) */}
            <div className="flex flex-col gap-2 text-xs border-t border-[var(--color-line)]/50 pt-4 font-body">
              <div className="flex items-baseline gap-4">
                <span className="w-24 uppercase text-[10.5px] tracking-[0.14em] font-medium text-[var(--color-deep-brown)] shrink-0">
                  Model
                </span>
                <span className="text-[var(--color-muted)]">
                  {product.modelHeightAndSize || "Model is 5'9\", wearing size S"}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="w-24 uppercase text-[10.5px] tracking-[0.14em] font-medium text-[var(--color-deep-brown)] shrink-0">
                  Materials
                </span>
                <span className="text-[var(--color-muted)]">
                  Shell: 100% {product.fabric || 'Chanderi Silk'} • {product.embroideryType || 'Hand Embroidered'}
                </span>
              </div>
            </div>

            {/* Collapsible Accordion: More Detail ⌵ */}
            <div className="border-t border-[var(--color-line)]/50 pt-3">
              <button
                type="button"
                onClick={() => setIsMoreDetailOpen(!isMoreDetailOpen)}
                className="w-full flex items-center justify-between text-[11px] uppercase tracking-[0.16em] font-medium text-[var(--color-deep-brown)] hover:text-[var(--color-wine)] py-2 transition-colors cursor-pointer text-left"
              >
                <span>More Detail</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className={`transition-transform duration-200 ${isMoreDetailOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M1 3.5l4 4 4-4" />
                </svg>
              </button>

              {isMoreDetailOpen && (
                <div className="flex flex-col gap-3 py-3 text-xs text-[var(--color-muted)] font-body animate-in fade-in duration-200">
                  {product.components && product.components.length > 0 && (
                    <div>
                      <strong className="text-[var(--color-deep-brown)]">Components: </strong>
                      {product.components.join(', ')}
                    </div>
                  )}
                  {product.care && product.care.length > 0 && (
                    <div>
                      <strong className="text-[var(--color-deep-brown)]">Care: </strong>
                      {product.care.join(' • ')}
                    </div>
                  )}
                  <div>
                    <strong className="text-[var(--color-deep-brown)]">Shipping: </strong>
                    {product.deliveryEstimate || 'Complimentary insured domestic shipping. Dispatched in 5-7 business days.'}
                  </div>
                </div>
              )}
            </div>

            {/* ─── COMPLETE THE LOOK (2 Curated Side-by-Side Items) ─────────────── */}
            {completeTheLookItems.length > 0 && (
              <div className="border-t border-[var(--color-line)]/50 pt-5 mt-2">
                <h3 className="text-[11px] uppercase tracking-[0.18em] font-medium text-[var(--color-deep-brown)] mb-3">
                  Complete The Look
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {completeTheLookItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/shop/${item.slug}`}
                      className="group flex flex-col gap-2 focus-visible:outline-none"
                    >
                      <div className="relative aspect-[3/4] bg-[var(--color-cream)]/40 overflow-hidden border border-[var(--color-line)]/50 rounded-none">
                        <Image
                          src={item.images[0]?.src || '/images/products/placeholder-1.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 1024px) 50vw, 20vw"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-[var(--color-deep-brown)] group-hover:text-[var(--color-wine)] transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-[var(--color-muted)] font-body">
                          Rs. {item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── 3. Recommended Products Rail ─────────────────────────────────────── */}
        {recommendedItems.length > 0 && (
          <section className="border-t border-[var(--color-line)]/60 pt-16 mt-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl md:text-2xl uppercase tracking-[0.14em] text-[var(--color-deep-brown)]">
                <span className="italic font-normal text-[var(--color-wine)]">Recommended</span> Products
              </h2>

              {/* Previous & Next Text Navigation (Directly Matching Reference) */}
              <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.18em] font-medium text-[var(--color-deep-brown)]">
                <button
                  type="button"
                  onClick={() => scrollRail('prev')}
                  className="hover:text-[var(--color-wine)] transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-[var(--color-line)]">/</span>
                <button
                  type="button"
                  onClick={() => scrollRail('next')}
                  className="hover:text-[var(--color-wine)] transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Product Cards Rail */}
            <div
              ref={railRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth"
            >
              {recommendedItems.map((recProduct) => (
                <div key={recProduct.id} className="min-w-[220px] md:min-w-0">
                  <ProductCard product={recProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Size Guide Modal Popup */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
}
