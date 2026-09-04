import Image from 'next/image';
import Link from 'next/link';
import { generatePlaceholderImage } from '@/lib/utils';
import { Metadata } from 'next';
import { RecentAcquisitions } from '@/frontend/components/account/RecentAcquisitions';

export const metadata: Metadata = {
  title: 'The Atelier | Bombay Edits',
};

export default function AccountPage() {
  return (
    <div
      className="bg-[#FAF6F0] min-h-screen font-body"
      style={{ paddingTop: '120px', paddingBottom: '96px' }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8A817C] mb-3 block font-medium">
              The Atelier
            </span>
            <h1 className="font-display text-[42px] leading-[1.1] text-[#4A3025]">
              Welcome back,
              <br />
              Madame Anya.
            </h1>
          </div>
          <div className="mt-8 md:mt-0 flex flex-col items-end">
            <span className="text-[10px] text-[#8A817C] mb-2 font-medium">
              Member since MMXVIII
            </span>
            <button className="text-[9px] uppercase tracking-[0.25em] text-[#4A3025] border-b border-[#4A3025] pb-0.5 font-medium transition-opacity hover:opacity-70">
              Sign out
            </button>
          </div>
        </div>

        {/* Top Divider */}
        <hr
          className="border-t border-[#E5DFD5]"
          style={{ marginTop: '48px', marginBottom: '64px' }}
        />

        {/* Two Columns Layout */}
        <div className="flex flex-col lg:flex-row" style={{ gap: '80px' }}>
          {/* Left Column (Approx 60%) */}
          <div className="lg:w-[58%]">
            {/* Framed Portrait */}
            <div className="border border-[#E5DFD5] p-2 bg-white">
              <div className="relative w-full aspect-[4/5] bg-[#FAF6F0]">
                <Image
                  src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80"
                  alt="Madame Anya Portrait"
                  fill
                  priority
                  className="object-cover grayscale"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>

            {/* Divider */}
            <hr
              className="border-t border-[#E5DFD5]"
              style={{ marginTop: '48px', marginBottom: '48px' }}
            />

            {/* Bespoke Measurements */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <h2 className="font-display text-[32px] text-[#4A3025]">Bespoke Measurements</h2>
                <button className="text-[9px] uppercase tracking-[0.25em] text-[#8A817C] border-b border-[#8A817C] pb-0.5 hover:text-[#4A3025] hover:border-[#4A3025] transition-colors">
                  Update
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Box 1 */}
                <div className="border border-[#E5DFD5] bg-transparent py-6 px-2 text-center flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A817C] mb-3 block">
                    Bust
                  </span>
                  <span className="font-display text-2xl text-[#4A3025]">34"</span>
                </div>
                {/* Box 2 */}
                <div className="border border-[#E5DFD5] bg-transparent py-6 px-2 text-center flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A817C] mb-3 block">
                    Waist
                  </span>
                  <span className="font-display text-2xl text-[#4A3025]">26"</span>
                </div>
                {/* Box 3 */}
                <div className="border border-[#E5DFD5] bg-transparent py-6 px-2 text-center flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A817C] mb-3 block">
                    Hip
                  </span>
                  <span className="font-display text-2xl text-[#4A3025]">36"</span>
                </div>
                {/* Box 4 */}
                <div className="border border-[#E5DFD5] bg-transparent py-6 px-2 text-center flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#8A817C] mb-3 block">
                    Length
                  </span>
                  <span className="font-display text-2xl text-[#4A3025]">Regular</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Approx 40%) */}
          <div className="lg:w-[42%] flex flex-col">
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-5 pt-2">
              <Link
                href="/account/orders"
                className="font-display text-2xl text-[#4A3025] hover:opacity-70 transition-opacity"
              >
                Purchased History
              </Link>
              <Link
                href="/wishlist"
                className="font-display text-2xl text-[#4A3025] hover:opacity-70 transition-opacity"
              >
                Wishlist Archives
              </Link>
              <Link
                href="/consultations"
                className="font-display text-2xl text-[#4A3025] hover:opacity-70 transition-opacity"
              >
                Consultations
              </Link>
            </nav>

            {/* Divider */}
            <hr
              className="border-t border-[#E5DFD5]"
              style={{ marginTop: '64px', marginBottom: '48px' }}
            />

            {/* Recent Acquisitions */}
            <RecentAcquisitions />

            {/* Divider */}
            <hr
              className="border-t border-[#E5DFD5]"
              style={{ marginTop: '64px', marginBottom: '48px' }}
            />

            {/* Curated For You */}
            <div>
              <span
                className="text-[9px] uppercase tracking-[0.2em] text-[#8A817C] block"
                style={{ marginBottom: '32px' }}
              >
                Curated For You
              </span>

              <Link
                href="/shop"
                className="block border border-[#E5DFD5] p-2 bg-white group hover:border-[#D5CFC5] transition-colors"
              >
                <div className="relative w-full aspect-[16/10] bg-[#FAF6F0] overflow-hidden">
                  <Image
                    src={generatePlaceholderImage(800, 500, 'winter-edit-coat')}
                    alt="The Viceroy Coat"
                    fill
                    className="object-cover grayscale transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Overlay Content */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-[8px] uppercase tracking-[0.2em] text-white/90 mb-1 block">
                        The Winter Edit
                      </span>
                      <span className="font-display text-xl text-white">The Viceroy Coat</span>
                    </div>
                    <div className="w-6 h-6 bg-white/90 flex items-center justify-center text-[#4A3025] text-sm">
                      +
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
