'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CollectionInfo } from '@/types/product';
import { products } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { generatePlaceholderImage } from '@/lib/utils';

interface SignatureEditPageProps {
  collection: CollectionInfo;
}

export function SignatureEditPage({ collection }: SignatureEditPageProps) {
  // Get products for the current collection
  const signatureProducts = products.filter(p => p.collections?.includes(collection.slug));

  return (
    <div className="bg-[#FAF7F2] text-[#7A6E64] font-body w-full overflow-hidden">
      
      {/* 1. Cinematic Hero */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={collection.heroImage || generatePlaceholderImage(1920, 1080, 'signature-hero')}
            alt={collection.name}
            fill
            unoptimized={true}
            className="object-cover"
            priority
          />
          {/* Subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2E241D]/40 via-[#2E241D]/10 to-[#FAF7F2]" />
        </div>
        
        <div className="relative z-10 text-center px-6 flex flex-col items-center" style={{ marginTop: '5vh' }}>
          <span className="text-[11px] tracking-[0.2em] uppercase text-white/80 mb-6">Archive 01</span>
          <h1 className="font-display text-[48px] md:text-[80px] text-white leading-none tracking-tight shadow-sm drop-shadow-lg">
            {collection.name}
          </h1>
          <p className="mt-8 text-[14px] md:text-[16px] text-white/90 max-w-[600px] mx-auto leading-relaxed drop-shadow-md">
            {collection.description}
          </p>
        </div>
      </section>

      {/* 2. Editorial Narrative Block */}
      <section className="w-full" style={{ padding: '160px 24px', maxWidth: '1440px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1 flex flex-col justify-center">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#8B7B6D] mb-4">The Inspiration</span>
            <h2 className="font-display text-[36px] md:text-[48px] text-[#2E241D] leading-tight mb-8">
              A masterclass in restraint and refinement.
            </h2>
            <div className="text-[15px] leading-[1.8] text-[#5A4A3E] space-y-6">
              <p>
                The Signature Edit represents the absolute pinnacle of our atelier's capabilities. These are not merely garments; they are heirloom artifacts designed to transcend seasons and fleeting trends.
              </p>
              <p>
                We spend months sourcing the rarest silks and partnering with master artisans whose lineages of craftsmanship stretch back generations. The result is a collection defined by architectural silhouettes and impossibly intricate Zardozi work.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative w-full bg-[#F1EBE0]" style={{ aspectRatio: '4/5' }}>
              <Image
                src={generatePlaceholderImage(800, 1000, 'signature-editorial')}
                alt="Signature craftsmanship"
                fill
                unoptimized={true}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Asymmetrical Lookbook Grid */}
      <section className="w-full bg-[#F1EBE0]" style={{ padding: '160px 0' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px' }}>
          <div className="text-center" style={{ marginBottom: '100px' }}>
            <h2 className="font-display text-[36px] md:text-[48px] text-[#2E241D]">The Lookbook</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
            {/* Image 1: Tall */}
            <div className="md:col-span-5 md:mt-24">
              <div className="relative w-full bg-white" style={{ aspectRatio: '3/4' }}>
                <Image
                  src={generatePlaceholderImage(600, 800, 'lookbook-1')}
                  alt="Lookbook 1"
                  fill
                  unoptimized={true}
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Image 2: Wide */}
            <div className="md:col-span-7">
              <div className="relative w-full bg-white" style={{ aspectRatio: '16/10' }}>
                <Image
                  src={generatePlaceholderImage(1000, 625, 'lookbook-2')}
                  alt="Lookbook 2"
                  fill
                  unoptimized={true}
                  className="object-cover"
                />
              </div>
              
              {/* Image 3: Square */}
              <div className="relative w-full bg-white mt-6 md:mt-12 md:w-3/4 md:ml-auto" style={{ aspectRatio: '1/1' }}>
                <Image
                  src={generatePlaceholderImage(800, 800, 'lookbook-3')}
                  alt="Lookbook 3"
                  fill
                  unoptimized={true}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Curated Product Showcase */}
      <section className="w-full" style={{ padding: '160px 24px', maxWidth: '1440px', margin: '0 auto' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between" style={{ marginBottom: '80px' }}>
          <div className="max-w-[500px]">
            <h2 className="font-display text-[36px] md:text-[48px] text-[#2E241D] leading-none mb-4">
              Shop The Edit
            </h2>
            <p className="text-[14px] text-[#8B7B6D] leading-[1.6]">
              Explore the individual pieces that make up the signature collection. 
              Each item is made to order and can be tailored to your precise measurements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {signatureProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

    </div>
  );
}
