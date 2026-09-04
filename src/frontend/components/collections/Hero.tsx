import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full min-h-[560px] md:min-h-[70vh] xl:min-h-[max(620px,86vh)] bg-[var(--color-ink)] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1616583936499-d4116e7e2e76?auto=format&fit=crop&w=2400&h=1600&q=80"
        alt="Collections Hero"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#1E1612] opacity-[0.28]" />
      
      <div className="absolute left-0 right-0 top-[44%] -translate-y-1/2 flex flex-col items-center justify-center px-6">
        <h1 
          className="text-white text-center tracking-[0.01em] uppercase"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 400, lineHeight: 1.18 }}
        >
          <span className="block text-[28px] md:text-[38px] lg:text-[46px] xl:text-[56px]">BRINGING BOMBAY'S</span>
          <span className="block text-[28px] md:text-[38px] lg:text-[46px] xl:text-[56px]">FINEST</span>
          <span className="block text-[28px] md:text-[38px] lg:text-[46px] xl:text-[56px]">TO NEPAL</span>
        </h1>
        
        <button 
          className="mt-[30px] font-body text-[11px] tracking-[0.1em] uppercase text-white px-[30px] py-[13px] border border-[rgba(255,255,255,0.55)] bg-[rgba(30,22,18,0.35)] hover:bg-white hover:text-[var(--color-ink)] transition-colors duration-200"
        >
          EXPLORE COLLECTION
        </button>
      </div>
    </section>
  );
}
