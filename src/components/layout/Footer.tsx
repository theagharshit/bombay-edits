import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#4A2C1D] text-[#FAF7F2] mt-auto relative overflow-hidden font-body min-h-[200px] md:h-[300px] flex items-end">
      
      {/* Watermark Wordmark */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5%] md:bottom-[-12%] w-full flex justify-center pointer-events-none select-none z-0">
        <span 
          className="font-display font-medium text-[#5C3A2A] leading-none whitespace-nowrap tracking-tight"
          style={{ fontSize: 'min(18vw, 320px)' }}
        >
          BOMBAY EDITS
        </span>
      </div>

      <div className="container-site relative z-10 w-full pb-8 md:pb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <p className="text-[12px] uppercase tracking-widest text-center md:text-left">
            © 2026 BOMBAY EDIT. A CHRONICLE OF STYLE.
          </p>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-[12px] uppercase tracking-widest">
            <Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link>
            <Link href="/policies/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link>
            <Link href="/policies/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/store-locator" className="hover:text-white transition-colors">Store Locator</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

        </div>
      </div>

    </footer>
  );
}
