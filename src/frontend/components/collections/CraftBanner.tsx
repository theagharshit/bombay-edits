import Image from 'next/image';

export function CraftBanner() {
  return (
    <section
      className="relative w-full min-h-[360px] md:min-h-[420px] lg:min-h-[560px] bg-[var(--color-ink)] overflow-hidden"
      style={{ aspectRatio: '21/9' }}
    >
      <Image
        src="https://images.unsplash.com/photo-1583391733958-6925e0a6d091?auto=format&fit=crop&w=2400&h=1000&q=80"
        alt="Craftsmanship"
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#1E1612] opacity-[0.30]" />

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-[560px] mx-auto">
          <h2
            className="text-white text-center"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 400, lineHeight: 1.35 }}
          >
            <span className="block text-[24px] md:text-[38px] lg:text-[32px] xl:text-[38px]">
              Made Slowly.
            </span>
            <span className="block text-[24px] md:text-[38px] lg:text-[32px] xl:text-[38px]">
              Crafted Beautifully.
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
}
