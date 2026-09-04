import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full min-h-[88vh] md:min-h-[640px] flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1619516388835-2b60acc4049e?auto=format&fit=crop&w=2000&q=80"
          alt="An Edit of Modern Romance"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Flat dark overlay */}
      <div className="absolute inset-0 z-10" style={{ backgroundColor: 'rgba(30,22,18,0.32)' }} />

      {/* Bottom gradient overlay to ivory */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none" 
        style={{
          background: 'linear-gradient(to bottom, transparent 78%, var(--color-ivory) 100%)'
        }}
      />

      {/* Content Block positioned at 52% height */}
      <div 
        className="relative z-30 flex flex-col items-center text-center w-full px-6"
        style={{ top: '2%' }} // 50% from flex-center + 2% = 52% roughly, but using absolute might be more precise.
      >
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h1 className="font-hero-1 text-white">An Edit of</h1>
          <h1 className="font-hero-1 text-white italic">Modern Romance</h1>
        </div>

        <Link
          href="/shop"
          className="font-btn text-white border border-white hover:bg-white hover:text-[var(--color-ink)] transition-colors duration-200"
          style={{ marginTop: '44px', padding: '15px 36px' }}
        >
          SHOP THE EDIT
        </Link>
      </div>
    </section>
  );
}
