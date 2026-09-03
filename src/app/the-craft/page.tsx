import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'A chronicle of style, woven into the historic fabric of Old Bombay. We resurrect the elegance of a bygone era for the modern connoisseur.',
};

export default function TheCraftPage() {
  return (
    <div className="bg-[#FAF7F2] text-[#7A6E64] font-body w-full overflow-hidden">
      {/* 4.1: ONE CONTAINER FOR THE WHOLE PAGE */}
      <div
        className="w-full px-6 md:px-10 lg:px-16 pt-[72px] md:pt-[140px] pb-[96px] md:pb-[200px]"
        style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '200px' }}
      >
        {/* Page header block */}
        <header className="flex flex-col items-center text-center">
          <h1 className="font-display text-[36px] md:text-[56px] text-[#5C3A2A] leading-none whitespace-nowrap">
            Our Story
          </h1>
          <p
            className="text-[15px] leading-[1.7] mt-[48px] md:mt-[64px]"
            style={{ maxWidth: '620px', margin: '48px auto 0 auto' }}
          >
            A chronicle of style, woven into the historic fabric of Old Bombay. We resurrect the
            elegance of a bygone era for the modern connoisseur.
          </p>
        </header>

        {/* 4.5: Space between intro and timeline - Apply as padding on wrapper */}
        <section
          className="relative pt-[96px] md:pt-[200px]"
          style={{ width: '100%', paddingTop: '200px' }}
        >
          {/* 4.2: Centre the rule - Exact horizontal centre of the container */}
          <div
            className="hidden md:block absolute bg-[#D9CDBC]"
            style={{ left: '50%', top: 0, bottom: 0, width: '1px', marginLeft: '-0.5px' }}
          />

          {/* 4.3: Make each entry symmetrical - Grid with two equal columns */}
          {/* Row 1: Provenance */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 mb-[160px] md:mb-[240px]"
            style={{ width: '100%', marginBottom: '240px' }}
          >
            {/* Left Column (Text) */}
            <div
              className="flex flex-col md:items-end md:text-right relative order-2 md:order-1 mt-8 md:mt-0 pr-0 md:pr-0"
              style={{ paddingRight: '0' }}
            >
              <div className="hidden md:block md:pr-[72px]" style={{ paddingRight: '72px' }}>
                <div
                  className="absolute top-[8px] rounded-none border border-[#D9CDBC] bg-[#FAF7F2] z-10 hidden md:block"
                  style={{ right: '-6px', width: '12px', height: '12px' }}
                />

                <div className="w-full" style={{ maxWidth: '400px' }}>
                  <h2 className="font-display text-[24px] md:text-[32px] italic text-[#5C3A2A] mb-8 leading-tight">
                    Provenance
                  </h2>
                  <p className="text-[14px] leading-[1.75]">
                    Rooted in the colonial architecture and vibrant street life of South Bombay, our
                    inspiration is drawn from the juxtaposed realities of the city. Every silhouette
                    echoes the grand archways and the whispered secrets of old members&apos; clubs.
                  </p>
                </div>
              </div>
              {/* Mobile text block wrapper since we used md:pr-[72px] above */}
              <div className="md:hidden w-full" style={{ maxWidth: '400px' }}>
                <h2 className="font-display text-[24px] md:text-[32px] italic text-[#5C3A2A] mb-8 leading-tight">
                  Provenance
                </h2>
                <p className="text-[14px] leading-[1.75]">
                  Rooted in the colonial architecture and vibrant street life of South Bombay, our
                  inspiration is drawn from the juxtaposed realities of the city. Every silhouette
                  echoes the grand archways and the whispered secrets of old members&apos; clubs.
                </p>
              </div>
            </div>

            {/* Right Column (Image) */}
            <div
              className="flex md:justify-start order-1 md:order-2 pl-0 md:pl-0"
              style={{ paddingLeft: '0' }}
            >
              <div className="hidden md:flex w-full justify-start" style={{ paddingLeft: '72px' }}>
                <div
                  className="relative w-full bg-cream"
                  style={{ maxWidth: '480px', maxHeight: '600px', aspectRatio: '4/5' }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1519955045385-7cdb8e07c76f?auto=format&fit=crop&w=480&h=600&q=80"
                    alt="Colonial architecture"
                    fill
                    className="object-cover grayscale sepia-[0.2]"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              </div>
              <div className="md:hidden w-full flex justify-start">
                <div
                  className="relative w-full bg-cream"
                  style={{ maxWidth: '480px', maxHeight: '600px', aspectRatio: '4/5' }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1519955045385-7cdb8e07c76f?auto=format&fit=crop&w=480&h=600&q=80"
                    alt="Colonial architecture"
                    fill
                    className="object-cover grayscale sepia-[0.2]"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Materiality */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 mb-[160px] md:mb-[240px]"
            style={{ width: '100%', marginBottom: '240px' }}
          >
            {/* Left Column (Image) */}
            <div
              className="flex md:justify-end order-1 md:order-1 pr-0 md:pr-0"
              style={{ paddingRight: '0' }}
            >
              <div className="hidden md:flex w-full justify-end" style={{ paddingRight: '72px' }}>
                <div
                  className="relative w-full bg-cream"
                  style={{ maxWidth: '480px', aspectRatio: '16/10' }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1571587289339-cb7da03fb5a6?auto=format&fit=crop&w=480&h=300&q=80"
                    alt="Textiles and materiality"
                    fill
                    className="object-cover sepia-[0.3]"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              </div>
              <div className="md:hidden w-full flex justify-end">
                <div
                  className="relative w-full bg-cream"
                  style={{ maxWidth: '480px', aspectRatio: '16/10' }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1571587289339-cb7da03fb5a6?auto=format&fit=crop&w=480&h=300&q=80"
                    alt="Textiles and materiality"
                    fill
                    className="object-cover sepia-[0.3]"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (Text) */}
            <div
              className="flex flex-col md:items-start md:text-left relative order-2 md:order-2 mt-8 md:mt-0 pl-0 md:pl-0"
              style={{ paddingLeft: '0' }}
            >
              <div className="hidden md:block" style={{ paddingLeft: '72px' }}>
                <div
                  className="absolute top-[8px] rounded-none border border-[#D9CDBC] bg-[#FAF7F2] z-10 hidden md:block"
                  style={{ left: '-6px', width: '12px', height: '12px' }}
                />

                <div className="w-full" style={{ maxWidth: '400px' }}>
                  <h2 className="font-display text-[24px] md:text-[32px] italic text-[#5C3A2A] mb-8 leading-tight">
                    Materiality
                  </h2>
                  <p className="text-[14px] leading-[1.75]">
                    We source only the finest indigenous textiles, honoring the hands that weave
                    them. Our commitment is to a tactile experience — garments that feel like
                    treasured heirlooms, blending rough khadi with smooth silks in unexpected
                    harmony.
                  </p>
                </div>
              </div>
              <div className="md:hidden w-full" style={{ maxWidth: '400px' }}>
                <h2 className="font-display text-[24px] md:text-[32px] italic text-[#5C3A2A] mb-8 leading-tight">
                  Materiality
                </h2>
                <p className="text-[14px] leading-[1.75]">
                  We source only the finest indigenous textiles, honoring the hands that weave them.
                  Our commitment is to a tactile experience — garments that feel like treasured
                  heirlooms, blending rough khadi with smooth silks in unexpected harmony.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Legacy */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ width: '100%' }}>
            {/* Left Column (Text) */}
            <div
              className="flex flex-col md:items-end md:text-right relative order-2 md:order-1 mt-8 md:mt-0 pr-0 md:pr-0"
              style={{ paddingRight: '0' }}
            >
              <div className="hidden md:block" style={{ paddingRight: '72px' }}>
                <div
                  className="absolute top-[8px] rounded-none border border-[#D9CDBC] bg-[#FAF7F2] z-10 hidden md:block"
                  style={{ right: '-6px', width: '12px', height: '12px' }}
                />

                <div className="w-full" style={{ maxWidth: '400px' }}>
                  <h2 className="font-display text-[24px] md:text-[32px] italic text-[#5C3A2A] mb-8 leading-tight">
                    Legacy
                  </h2>
                  <p className="text-[14px] leading-[1.75]">
                    Bombay Edits is not just fashion; it is an archive in motion. We are preserving
                    the romance of the past for the future. Each design sketch is a promise to
                    maintain the slow, deliberate pace of true luxury in a transient world.
                  </p>
                </div>
              </div>
              <div className="md:hidden w-full" style={{ maxWidth: '400px' }}>
                <h2 className="font-display text-[24px] md:text-[32px] italic text-[#5C3A2A] mb-8 leading-tight">
                  Legacy
                </h2>
                <p className="text-[14px] leading-[1.75]">
                  Bombay Edits is not just fashion; it is an archive in motion. We are preserving
                  the romance of the past for the future. Each design sketch is a promise to
                  maintain the slow, deliberate pace of true luxury in a transient world.
                </p>
              </div>
            </div>

            {/* Right Column (Image) */}
            <div
              className="flex md:justify-start order-1 md:order-2 pl-0 md:pl-0"
              style={{ paddingLeft: '0' }}
            >
              <div className="hidden md:flex w-full justify-start" style={{ paddingLeft: '72px' }}>
                <div
                  className="relative w-full bg-cream"
                  style={{ maxWidth: '480px', maxHeight: '600px', aspectRatio: '4/5' }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1524228529766-4d7fe5dc55ca?auto=format&fit=crop&w=480&h=600&q=80"
                    alt="Design sketches"
                    fill
                    className="object-cover grayscale"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              </div>
              <div className="md:hidden w-full flex justify-start">
                <div
                  className="relative w-full bg-cream"
                  style={{ maxWidth: '480px', maxHeight: '600px', aspectRatio: '4/5' }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1524228529766-4d7fe5dc55ca?auto=format&fit=crop&w=480&h=600&q=80"
                    alt="Design sketches"
                    fill
                    className="object-cover grayscale"
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
