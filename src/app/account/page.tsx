import Image from 'next/image';
import Link from 'next/link';
import { generatePlaceholderImage } from '@/lib/utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Atelier | Bombay Edits',
};

export default function AccountPage() {
  return (
    <div className="bg-ivory text-deep-brown font-body">
      
      {/* Header */}
      <div className="pt-24 pb-12 px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto flex flex-col md:flex-row md:justify-between md:items-end border-b border-border">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2 block">The Atelier</span>
          <h1 className="font-display text-3xl md:text-4xl text-chocolate mb-2">Welcome back,<br />Madame Anya.</h1>
          <p className="text-xs text-text-muted">Client No. 04829 — Since 2021</p>
        </div>
        <div className="mt-8 md:mt-0 text-right">
          <p className="text-xs text-text-muted mb-2">Member since MMXVIII</p>
          <button className="text-[10px] uppercase tracking-[0.2em] border-b border-border hover:border-chocolate hover:text-chocolate pb-0.5 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="px-6 md:px-12 lg:px-24 py-12 md:py-24 max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column */}
          <div className="lg:w-7/12">
            
            {/* Hero Image */}
            <div className="relative w-full aspect-[4/5] bg-cream p-4 border border-border mb-16">
              <div className="relative w-full h-full">
                <Image 
                  src={generatePlaceholderImage(800, 1000, 'madame-anya')} 
                  alt="Madame Anya profile" 
                  fill 
                  className="object-cover grayscale"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>

            {/* Bespoke Measurements */}
            <div>
              <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
                <h2 className="font-display text-3xl text-chocolate">Bespoke Measurements</h2>
                <button className="text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-chocolate transition-colors">
                  Update
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border border-border p-6 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Bust</p>
                  <p className="font-display text-2xl text-chocolate">34&quot;</p>
                </div>
                <div className="border border-border p-6 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Waist</p>
                  <p className="font-display text-2xl text-chocolate">26&quot;</p>
                </div>
                <div className="border border-border p-6 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Hip</p>
                  <p className="font-display text-2xl text-chocolate">36&quot;</p>
                </div>
                <div className="border border-border p-6 text-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">Length</p>
                  <p className="font-display text-2xl text-chocolate">Regular</p>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column */}
          <div className="lg:w-5/12">
            
            {/* Nav Links */}
            <ul className="space-y-6 mb-24 font-display text-2xl text-dark-espresso">
              <li><Link href="/account/orders" className="hover:text-champagne-gold transition-colors">Purchased History</Link></li>
              <li><Link href="/account/addresses" className="hover:text-champagne-gold transition-colors">Saved Addresses</Link></li>
              <li><Link href="/wishlist" className="hover:text-champagne-gold transition-colors">Wishlist Archives</Link></li>
              <li><Link href="/the-craft" className="hover:text-champagne-gold transition-colors">The Craft Atelier</Link></li>
            </ul>

            {/* Recent Acquisitions */}
            <div className="mb-24">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-taupe border-b border-beige-line pb-4 mb-8">
                Recent Acquisitions
              </h3>
              
              <div className="space-y-8">
                {/* Item 1 */}
                <div className="flex gap-6">
                  <div className="relative w-24 aspect-[4/5] bg-cream flex-shrink-0">
                    <Image 
                      src={generatePlaceholderImage(200, 250, 'malabar-blouse')} 
                      alt="Malabar Silk Blouse" 
                      fill 
                      className="object-cover sepia-[0.2]" 
                      sizes="96px"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-taupe mb-2">Delivered: Oct 12</p>
                    <p className="font-display text-lg text-dark-espresso mb-1">The Malabar Silk Blouse</p>
                    <p className="text-xs text-chocolate-brown font-body">Ivory / Size 2 / Bespoke Fit</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-6">
                  <div className="relative w-24 aspect-[4/5] bg-cream flex-shrink-0">
                    <Image 
                      src={generatePlaceholderImage(200, 250, 'heritage-scarf')} 
                      alt="Heritage Zari Scarf" 
                      fill 
                      className="object-cover sepia-[0.2]" 
                      sizes="96px"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-taupe mb-2">Delivered: Aug 04</p>
                    <p className="font-display text-lg text-dark-espresso mb-1">Heritage Zari Scarf</p>
                    <p className="text-xs text-chocolate-brown font-body">Umber / Free Size</p>
                  </div>
                </div>
              </div>
              
              <Link href="/account/orders" className="inline-block mt-12 bg-dark-espresso text-cream px-8 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-chocolate-brown transition-colors">
                View Full Archive
              </Link>
            </div>

            {/* Curated For You */}
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-taupe border-b border-beige-line pb-4 mb-8">
                Curated For You
              </h3>
              <Link href="/shop" className="block relative aspect-video w-full border border-beige-line group overflow-hidden cursor-pointer">
                <Image 
                  src={generatePlaceholderImage(800, 450, 'winter-edit-coat')} 
                  alt="The Viceroy Coat" 
                  fill 
                  className="object-cover grayscale transition-transform duration-700 group-hover:scale-105" 
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div className="text-cream">
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-1">The Festive Edit</p>
                    <p className="font-display text-3xl">The Viceroy Coat</p>
                  </div>
                  <div className="w-8 h-8 bg-cream text-dark-espresso flex items-center justify-center text-lg leading-none shrink-0 rounded-none">
                    +
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
