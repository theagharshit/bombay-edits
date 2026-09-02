import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Providers } from './providers';

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'The Bombay Edit — Handcrafted Indian ethnic wear',
    template: '%s | The Bombay Edit',
  },
  description: 'Handcrafted Indian ethnic wear for the modern woman. Kurta sets, co-ord sets, shararas and occasionwear made with Indian craftsmanship, brought from Bombay to Nepal.',
  keywords: ['Indian ethnic wear', 'kurta sets', 'handcrafted', 'Bombay', 'Nepal', 'women fashion', 'embroidered', 'occasionwear'],
  authors: [{ name: 'The Bombay Edit' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'The Bombay Edit',
    title: 'The Bombay Edit — Handcrafted Indian ethnic wear',
    description: 'Indian craft, reimagined for the woman you are. Handcrafted ethnic wear brought from Bombay to Nepal.',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://thebombayedit.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorantGaramond.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full w-full flex flex-col antialiased overflow-x-hidden">
        <Providers>
          <Header />
          <main className="flex-1 w-full flex flex-col">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
