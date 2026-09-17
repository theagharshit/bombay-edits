import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Providers } from '../providers';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <main className="m-0 p-0 flex-1 w-full flex flex-col">{children}</main>
      <Footer />
      <CartDrawer />
    </Providers>
  );
}
