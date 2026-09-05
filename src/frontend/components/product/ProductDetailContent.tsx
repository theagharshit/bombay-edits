'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCurrency } from '@/context/CurrencyContext';
import { getProductPlaceholder } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailContent({ product }: Props) {
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { format } = useCurrency();
  const wishlisted = isWishlisted(product.id);
  const router = useRouter();

  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            src: getProductPlaceholder('front', product.slug),
            alt: product.name,
            type: 'front' as const,
          },
          {
            src: getProductPlaceholder('back', product.slug),
            alt: `${product.name} back`,
            type: 'back' as const,
          },
          {
            src: getProductPlaceholder('detail', product.slug),
            alt: `${product.name} detail`,
            type: 'detail' as const,
          },
          {
            src: getProductPlaceholder('lifestyle', product.slug),
            alt: `${product.name} lifestyle`,
            type: 'lifestyle' as const,
          },
        ];

  const handleAddToBag = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: images[0].src,
      colour: product.colour.name,
      size: product.availableSizes[0] || 'Free Size',
      quantity: 1,
      maxQuantity: 5,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      router.push('/cart');
    }, 500);
  };

  return (
    <div className="bg-ivory text-deep-brown font-body">
      {/* Breadcrumb / Top Bar */}
      <div className="pt-24 px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto flex justify-between items-center mb-12">
        <div className="text-[10px] uppercase tracking-widest text-text-muted flex gap-2">
          <Link href="/shop" className="hover:text-chocolate transition-colors">
            The Edit
          </Link>
          <span>/</span>
          <span className="text-chocolate">Bridal Archives</span>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-chocolate">
          Heritage Collection
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto pb-32">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          {/* Left — Image Grid */}
          <div className="lg:w-7/12 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] relative bg-cream shadow-sm">
                <Image
                  src={images[0].src}
                  alt={images[0].alt}
                  fill
                  className="object-cover sepia-[0.1]"
                  sizes="(max-width: 1024px) 50vw, 35vw"
                />
              </div>
              <div className="aspect-[4/5] relative bg-cream shadow-sm">
                <Image
                  src={images[1].src}
                  alt={images[1].alt}
                  fill
                  className="object-cover sepia-[0.1]"
                  sizes="(max-width: 1024px) 50vw, 35vw"
                />
              </div>
              <div className="aspect-video relative bg-cream shadow-sm">
                <Image
                  src={images[2].src}
                  alt={images[2].alt}
                  fill
                  className="object-cover sepia-[0.1]"
                  sizes="(max-width: 1024px) 50vw, 35vw"
                />
              </div>
              <div className="aspect-video relative bg-cream shadow-sm">
                <Image
                  src={images[3].src}
                  alt={images[3].alt}
                  fill
                  className="object-cover sepia-[0.1]"
                  sizes="(max-width: 1024px) 50vw, 35vw"
                />
                <div className="absolute bottom-4 left-4 bg-ivory/90 backdrop-blur-sm px-3 py-1.5 text-[10px] uppercase tracking-widest text-chocolate border border-ivory">
                  {product.name}
                </div>
              </div>
            </div>
          </div>

          {/* Right — Product Info Box */}
          <div className="lg:w-5/12 w-full lg:sticky lg:top-24">
            <div className="bg-[#FAF8F5] p-8 md:p-12 lg:p-16 border border-border ml-0 lg:-ml-12 relative z-10 shadow-sm">
              <h1 className="font-display text-3xl md:text-4xl text-chocolate mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-sm italic text-text-muted mb-8 font-display text-lg">
                {product.shortDescription}
              </p>

              <div className="text-3xl text-chocolate mb-12">{format(product.price)}</div>

              {/* Anatomy of Craft */}
              <div className="mb-12">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-6">
                  Anatomy of Craft
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-border-light pb-2">
                    <span className="text-xs font-body text-text-muted">Warp Density</span>
                    <span className="text-xs font-body text-chocolate">120 Ends/Inch</span>
                  </div>
                  <div className="flex justify-between border-b border-border-light pb-2">
                    <span className="text-xs font-body text-text-muted">Tension Rating</span>
                    <span className="text-xs font-body text-chocolate">High-Twist Silk</span>
                  </div>
                  <div className="flex justify-between border-b border-border-light pb-2">
                    <span className="text-xs font-body text-text-muted">Zari Purity</span>
                    <span className="text-xs font-body text-chocolate">98% Silver Core</span>
                  </div>
                  <div className="flex justify-between border-b border-border-light pb-2">
                    <span className="text-xs font-body text-text-muted">Origin Looms</span>
                    <span className="text-xs font-body text-chocolate">Malabar Coast, India</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-6 text-center">
                <button
                  onClick={handleAddToBag}
                  className="w-full bg-chocolate text-ivory py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-deep-brown transition-colors cursor-pointer"
                >
                  {added ? 'Added to Bag' : 'Bespoke Tailoring Inquiry'}
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="w-full text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-chocolate transition-colors cursor-pointer"
                >
                  {wishlisted ? 'Remove from Archive' : 'Add to Archive (Wishlist)'}
                </button>
              </div>

              <div className="mt-16 text-center">
                <a
                  href="#story"
                  className="text-[10px] uppercase tracking-[0.2em] text-text-muted border-b border-text-muted hover:text-chocolate hover:border-chocolate pb-1 transition-colors"
                >
                  Read the story ↓
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <section id="story" className="px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto pb-32">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center">
          <div className="md:w-1/2">
            <h2 className="font-display text-4xl text-chocolate mb-8">The Looms of Malabar</h2>
            <div className="space-y-6 text-sm leading-relaxed text-text-muted">
              <p>
                To construct {product.name} is to engage in an architectural feat of textile
                engineering. For six months, master artisans employ a specialized high-tension
                weaving technique, ensuring the raw silk achieves a structural integrity capable of
                supporting the immense weight of the pure zari embroidery.
              </p>
              <p>
                The motifs are not merely decorative; they are drawn from archival blueprints of
                colonial-era Bombay mansions—floral trellises echoing cast-iron balcony railings,
                and geometric borders mimicking intricate floor tiling. It is less a garment and
                more a wearable chronicle of a bygone metropolis.
              </p>
            </div>
            <button className="mt-8 text-[10px] uppercase tracking-[0.2em] text-chocolate border-b border-chocolate hover:text-ink hover:border-ink pb-0.5 transition-colors">
              Explore the Archive
            </button>
          </div>

          <div className="md:w-1/2 relative">
            <div className="aspect-[4/3] relative bg-cream shadow-sm p-4 w-full">
              <div className="relative w-full h-full">
                <Image
                  src={getProductPlaceholder('detail', 'loom')}
                  alt="Looms of Malabar"
                  fill
                  className="object-cover grayscale"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-ivory px-6 py-4 border border-border shadow-sm">
              <span className="font-display text-xl italic text-chocolate">Est. 1924</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
