'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { generatePlaceholderImage } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="bg-ivory text-cocoa font-body w-full flex-1 flex flex-col">
      {/* ─── 1. Hero ──────────────────────────────────────── */}
      <section className="relative w-full h-[72vh] lg:h-[88vh] min-h-[500px] overflow-hidden bg-ivory">
        <div className="absolute inset-0">
          <Image
            src={generatePlaceholderImage(1920, 1080, 'heritage')}
            alt="An Edit of Modern Romance"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Subtle dark scrim behind text for legibility */}
          <div className="absolute inset-0 bg-black/15" />
          {/* Soft vertical gradient fading to ivory at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ivory to-transparent" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-[80px] md:pt-[100px]">
          <h2 className="font-display text-5xl md:text-[72px] text-on-image leading-tight mb-0">
            An Edit of
            <br />
            <span className="italic">Modern Romance</span>
          </h2>
          <Link
            href="/shop"
            className="mt-12 inline-block bg-white text-espresso px-6 py-3 text-[11px] tracking-[0.18em] uppercase transition-colors hover:bg-white/90 rounded-none"
          >
            Shop the edit
          </Link>
        </div>
      </section>

      {/* ─── 2. The Latest Edit ────────────────────────────── */}
      <SectionWrapper
        bgClass="bg-ivory"
        className="pt-[160px] pb-[120px]"
        style={{ paddingTop: '160px', paddingBottom: '120px' }}
      >
        <div
          className="flex flex-col md:flex-row md:items-start justify-between mb-xl"
          style={{ marginBottom: '120px' }}
        >
          <div className="max-w-[420px]">
            <h2 className="font-display text-4xl md:text-[48px] text-espresso mb-0 leading-none">
              The Latest Edit
            </h2>
            <p className="text-[13px] text-muted mt-sm">
              Curated pieces from our newest collection, blending heritage craftsmanship with
              contemporary silhouettes.
            </p>
          </div>
          <Link
            href="/new-arrivals"
            className="mt-6 md:mt-0 md:self-baseline text-[11px] tracking-[0.18em] uppercase text-espresso border-b border-espresso pb-1 hover:text-muted hover:border-muted transition-colors whitespace-nowrap"
          >
            View all arrivals
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md gap-y-xl">
          {[
            {
              id: '1',
              slug: 'the-malabar-gown',
              name: 'The Malabar Gown',
              descriptor: 'Hand embroidered silk',
              price: '₹65,000',
              image1: generatePlaceholderImage(600, 800, 'gown-front'),
              image2: generatePlaceholderImage(600, 800, 'gown-back'),
            },
            {
              id: '2',
              slug: 'colaba-drape',
              name: 'Colaba Drape',
              descriptor: 'Structured georgette',
              price: '₹52,500',
              image1: generatePlaceholderImage(600, 800, 'drape-front'),
              image2: generatePlaceholderImage(600, 800, 'drape-back'),
            },
            {
              id: '3',
              slug: 'marine-pearl-cape',
              name: 'Marine Pearl Cape',
              descriptor: 'Sheer organza & pearls',
              price: '₹28,000',
              image1: generatePlaceholderImage(600, 800, 'cape-front'),
              image2: generatePlaceholderImage(600, 800, 'cape-back'),
            },
            {
              id: '4',
              slug: 'heritage-brocade',
              name: 'Heritage Brocade',
              descriptor: 'Woven metallic zari',
              price: '₹18,000',
              image1: generatePlaceholderImage(600, 800, 'brocade-front'),
              image2: generatePlaceholderImage(600, 800, 'brocade-back'),
            },
          ].map((product, i) => (
            <div
              key={product.id}
              className={`group ${i % 2 !== 0 ? 'lg:mt-8' : ''} transition-transform`}
            >
              <Link href={`/shop/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] mb-5 overflow-hidden bg-cream">
                  <Image
                    src={product.image1}
                    alt={product.name}
                    fill
                    className="object-cover transition-opacity duration-400 group-hover:opacity-0"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <Image
                    src={product.image2}
                    alt={product.name}
                    fill
                    className="object-cover absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  {i === 0 && (
                    <span className="absolute top-[12px] left-[12px] bg-ivory text-espresso text-[9px] uppercase tracking-[0.18em] px-2 py-1 z-10 rounded-none">
                      NEW IN
                    </span>
                  )}
                </div>
                <div className="text-center mt-5">
                  <h3 className="font-display text-lg md:text-[20px] text-espresso mb-0">
                    {product.name}
                  </h3>
                  <p className="text-[13px] text-muted mt-1-5 mb-0">{product.descriptor}</p>
                  <span className="text-[13px] font-body text-cocoa block mt-2xs">
                    {product.price}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ─── 3. Curated Collections ────────────────────────── */}
      <SectionWrapper bgClass="bg-cream">
        <div className="text-center mb-xl">
          <h2 className="font-display text-4xl md:text-[48px] text-espresso mb-0">
            Curated Collections
          </h2>
          <p className="text-[15px] text-muted italic font-display mt-sm">
            Discover our tailored edits for every grand occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-sm">
          {/* Left: Bridal Edit (spans 2 rows on desktop) */}
          <div className="relative aspect-[3/4] lg:aspect-auto lg:col-span-1 lg:row-span-2 min-h-[400px]">
            <Image
              src={generatePlaceholderImage(800, 1200, 'bridal')}
              alt="The Bridal Edit"
              fill
              className="object-cover transition-opacity duration-400 hover:opacity-95"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-lg left-lg right-lg z-10 flex flex-col items-start text-left">
              <h3 className="font-display text-[40px] text-on-image mb-md">The Bridal Edit</h3>
              <Link
                href="/collections/bridal-edit"
                className="inline-block border border-white text-on-image px-6 py-2 text-[11px] tracking-[0.18em] uppercase hover:bg-white hover:text-espresso transition-colors rounded-none"
              >
                Explore
              </Link>
            </div>
          </div>

          {/* Top Middle: Festive Image */}
          <div className="relative aspect-square md:aspect-[4/5] lg:aspect-auto lg:col-span-1 lg:row-span-1 min-h-[350px]">
            <Image
              src={generatePlaceholderImage(800, 800, 'festive')}
              alt="Festive Collection"
              fill
              className="object-cover transition-opacity duration-400 hover:opacity-95"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>

          {/* Top Right: Festive Text */}
          <div className="bg-sand p-lg flex flex-col items-center justify-center text-center lg:col-span-1 lg:row-span-1 min-h-[350px]">
            <h3 className="font-display text-[40px] text-espresso mb-0">The Festive Edit</h3>
            <p className="text-[15px] text-muted mt-xs mb-md leading-relaxed max-w-[250px]">
              Joyous colours and lightweight luxury for modern celebrations.
            </p>
            <Link
              href="/collections/festive-edit"
              className="inline-block border border-espresso text-espresso px-6 py-2 text-[11px] tracking-[0.18em] uppercase hover:bg-espresso hover:text-white transition-colors rounded-none"
            >
              Discover
            </Link>
          </div>

          {/* Bottom Middle: Evening Text (Mobile order altered to flow better) */}
          <div className="bg-sand p-lg flex flex-col items-center justify-center text-center lg:col-span-1 lg:row-span-1 min-h-[350px] order-last md:order-none lg:order-none">
            <h3 className="font-display text-[40px] text-espresso mb-0">The Evening Edit</h3>
            <p className="text-[15px] text-muted mt-xs mb-md leading-relaxed max-w-[250px]">
              Sartorial elegance designed for after-dark glamour.
            </p>
            <Link
              href="/collections/evening-edit"
              className="inline-block border border-espresso text-espresso px-6 py-2 text-[11px] tracking-[0.18em] uppercase hover:bg-espresso hover:text-white transition-colors rounded-none"
            >
              Discover
            </Link>
          </div>

          {/* Bottom Right: Evening Image */}
          <div className="relative aspect-square md:aspect-[4/5] lg:aspect-auto lg:col-span-1 lg:row-span-1 min-h-[350px]">
            <Image
              src={generatePlaceholderImage(800, 800, 'evening')}
              alt="The Evening Edit"
              fill
              className="object-cover transition-opacity duration-400 hover:opacity-95 filter brightness-90"
              sizes="(max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* ─── 4. Our Heritage ────────────────────────────────── */}
      <SectionWrapper
        bgClass="bg-ivory relative overflow-hidden"
        className="py-[120px]"
        style={{ paddingTop: '120px', paddingBottom: '120px' }}
      >
        {/* Subtle architectural watermark (3% opacity) */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'url(https://www.transparenttextures.com/patterns/arabesque.png)',
            backgroundSize: '400px',
          }}
        ></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg md:gap-20 items-center relative z-10">
          <div className="lg:col-span-5 order-1 lg:order-none" style={{ width: '100%' }}>
            {/* Mounted polaroid style, no shadow, just a thin border mount */}
            <div
              className="p-4 border border-beige-line bg-ivory mx-auto lg:mx-0 lg:mt-8"
              style={{ maxWidth: '420px', width: '100%' }}
            >
              <div className="relative bg-cream" style={{ width: '100%', aspectRatio: '4/5' }}>
                <Image
                  src={generatePlaceholderImage(800, 1000, 'craft')}
                  alt="Artisan craftsmanship"
                  fill
                  className="object-cover grayscale"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-none mt-lg lg:mt-0">
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted mb-xs">
              Our Heritage
            </span>
            <h2 className="font-display text-[40px] lg:text-[48px] text-espresso mb-md leading-tight">
              Born from Bombay.
              <br />
              Edited by Anannya.
            </h2>
            <div className="flex flex-col gap-md text-[15px] text-cocoa leading-relaxed max-w-[500px]">
              <p>
                We draw our inspiration from the juxtaposition of the old world and the new. The
                fading grandeur of colonial architecture meets the vibrant, relentless pulse of
                modern India.
              </p>
              <p>
                Every garment is a narrative—handcrafted by master artisans, designed to transcend
                seasons, and tailored for the woman who carries her heritage with effortless grace.
              </p>
            </div>
            <Link
              href="/the-craft"
              className="inline-flex items-center gap-2 mt-8 text-[11px] tracking-[0.18em] uppercase text-espresso border-b border-transparent hover:border-espresso transition-colors self-start pb-0.5"
            >
              Read our story <span className="font-sans">→</span>
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
