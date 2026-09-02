import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-chocolate-brown text-cream mt-auto relative overflow-hidden font-body min-h-[200px] md:h-[300px] flex items-end">
      
      {/* Watermark Wordmark */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5%] md:bottom-[-12%] w-full flex justify-center pointer-events-none select-none z-0">
        <span 
          className="font-display font-medium text-dark-espresso/30 leading-none whitespace-nowrap tracking-tight"
          style={{ fontSize: 'min(18vw, 320px)' }}
        >
          BOMBAY EDITS
        </span>
      </div>

      <div className="container-site relative z-10 w-full pb-8 md:pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <p className="text-[12px] uppercase tracking-widest text-center md:text-left text-cream/90">
            © 2026 BOMBAY EDIT. A CHRONICLE OF STYLE.
          </p>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-[12px] uppercase tracking-widest">
            <Link href="/the-craft" className="hover:text-champagne-gold transition-colors">The Craft</Link>
            <Link href="/policies/shipping" className="hover:text-champagne-gold transition-colors">Shipping & Returns</Link>
            <Link href="/policies/privacy" className="hover:text-champagne-gold transition-colors">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-champagne-gold transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-champagne-gold transition-colors">Contact</Link>
          </nav>

        </div>
      </div>

    </footer>
  );
}
