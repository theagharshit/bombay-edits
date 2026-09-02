import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink text-chalk relative overflow-hidden font-body pt-16 md:pt-24 min-h-[400px] flex flex-col justify-between mt-auto">
      <div className="container-site relative z-10 w-full flex-1 flex flex-col">
        
        {/* Tier 1 & 2: Newsletter & Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 pb-16 md:pb-24 border-b border-chalk/10">
          
          {/* Newsletter */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="font-display text-3xl md:text-4xl mb-4">Join the Edit</h3>
            <p className="text-sm text-chalk/80 mb-8 max-w-sm">
              Sign up to receive 10% off your first order and exclusive access to new arrivals.
            </p>
            <form className="w-full max-w-md relative flex items-center border-b border-chalk/30 pb-2 focus-within:border-brass transition-colors">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-transparent text-sm tracking-widest uppercase placeholder:text-chalk/40 outline-none pr-8 text-chalk"
                required
              />
              <button 
                type="submit"
                aria-label="Subscribe"
                className="absolute right-0 text-chalk hover:text-brass transition-colors"
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4 text-sm">
            <div className="flex flex-col gap-5 items-center md:items-start">
              <h4 className="uppercase tracking-widest text-xs font-semibold text-chalk/40 mb-1">Shop</h4>
              <Link href="/collections/new-arrivals" className="hover:text-brass transition-colors w-fit">New In</Link>
              <Link href="/collections/bestsellers" className="hover:text-brass transition-colors w-fit">Bestsellers</Link>
              <Link href="/collections/kurtis" className="hover:text-brass transition-colors w-fit">Kurtis</Link>
              <Link href="/collections/co-ords" className="hover:text-brass transition-colors w-fit">Co-ords</Link>
            </div>
            <div className="flex flex-col gap-5 items-center md:items-start">
              <h4 className="uppercase tracking-widest text-xs font-semibold text-chalk/40 mb-1">The Brand</h4>
              <Link href="/about" className="hover:text-brass transition-colors w-fit">Our Story</Link>
              <Link href="/the-craft" className="hover:text-brass transition-colors w-fit">The Craft</Link>
              <Link href="/journal" className="hover:text-brass transition-colors w-fit">Journal</Link>
            </div>
            <div className="flex flex-col gap-5 items-center md:items-start">
              <h4 className="uppercase tracking-widest text-xs font-semibold text-chalk/40 mb-1">Assistance</h4>
              <Link href="/contact" className="hover:text-brass transition-colors w-fit">Contact Us</Link>
              <Link href="/faq" className="hover:text-brass transition-colors w-fit">FAQ</Link>
              <Link href="/policies/shipping" className="hover:text-brass transition-colors w-fit">Shipping & Returns</Link>
              <Link href="/track-order" className="hover:text-brass transition-colors w-fit">Track Order</Link>
            </div>
            <div className="flex flex-col gap-5 items-center md:items-start">
              <h4 className="uppercase tracking-widest text-xs font-semibold text-chalk/40 mb-1">Social</h4>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-brass transition-colors w-fit">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-brass transition-colors w-fit">Pinterest</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-brass transition-colors w-fit">Facebook</a>
            </div>
          </div>
        </div>

        {/* Tier 3: Legal & Copyright */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] sm:text-xs uppercase tracking-widest text-chalk/40">
          <p>© 2026 BOMBAY EDITS. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/policies/privacy" className="hover:text-brass transition-colors">Privacy Policy</Link>
            <Link href="/policies/terms" className="hover:text-brass transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Watermark Wordmark */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-2%] md:bottom-[-6%] w-full flex justify-center pointer-events-none select-none z-0 overflow-hidden">
        <span
          className="font-display font-medium text-chalk/[0.04] leading-none whitespace-nowrap tracking-tight"
          style={{ fontSize: 'min(22vw, 360px)' }}
        >
          BOMBAY EDITS
        </span>
      </div>
    </footer>
  );
}
