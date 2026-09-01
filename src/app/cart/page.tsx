'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { generatePlaceholderImage } from '@/lib/utils';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { format } = useCurrency();

  const relatedProducts = products.slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="bg-ivory text-deep-brown font-body min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-4xl text-chocolate mb-4">Your Archive is Empty</h1>
        <p className="text-sm text-text-muted mb-8 max-w-md">Your selection awaits. Discover our collection of handcrafted Indian ethnic wear.</p>
        <Link href="/shop" className="inline-block bg-chocolate text-ivory px-12 py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-deep-brown transition-colors">
          Explore The Edit
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ivory text-deep-brown font-body">
      
      {/* Header */}
      <div className="pt-24 pb-12 px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto flex justify-between items-end border-b border-border mb-12">
        <h1 className="font-display text-3xl md:text-4xl text-chocolate">The Heritage Selection</h1>
        <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2 hidden md:block">
          {itemCount} {itemCount === 1 ? 'Artisanal Piece' : 'Artisanal Pieces'}
        </span>
      </div>

      <div className="px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto mb-32">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Left — Items */}
          <div className="lg:w-2/3">
            <div className="space-y-12">
              {items.map(item => (
                <div key={`${item.productId}-${item.size}`} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-border">
                  
                  {/* Image */}
                  <div className="w-full md:w-1/3 aspect-[4/5] relative border border-border p-2 bg-cream shrink-0">
                    <div className="relative w-full h-full">
                      <Image
                        src={item.image || generatePlaceholderImage(300, 400, item.productId)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="w-full md:w-2/3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2 block">The Archives</span>
                      <Link href={`/shop/${item.slug}`} className="font-display text-3xl text-chocolate hover:opacity-70 transition-opacity mb-4 block">
                        {item.name}
                      </Link>
                      <p className="text-sm text-text-muted leading-relaxed mb-6">
                        Hand-spun organic silk in deep umber, featuring subtle zari thread work inspired by 1920s Malabar Hill aesthetics.
                      </p>
                      
                      <div className="flex gap-4 mb-8">
                        <span className="text-[10px] uppercase tracking-[0.2em] border border-border px-3 py-1.5 text-text-muted">Size: {item.size}</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] border border-border px-3 py-1.5 text-text-muted">Color: {item.colour}</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-xs font-body text-text-muted border-b border-border pb-1">
                          <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="hover:text-chocolate" aria-label="Decrease quantity">−</button>
                          <span className="text-chocolate">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="hover:text-chocolate" aria-label="Increase quantity">+</button>
                        </div>
                        <button onClick={() => removeItem(item.productId, item.size)} className="text-[10px] uppercase tracking-widest text-wine hover:opacity-70">
                          Remove
                        </button>
                      </div>
                      <div className="font-display text-2xl text-chocolate">
                        {format(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="lg:w-1/3 space-y-8 lg:sticky lg:top-24 lg:self-start">
            
            {/* Gift Dossier */}
            <div className="border border-border p-8 bg-[#FAF8F5]">
              <h2 className="font-display text-2xl text-chocolate mb-4 flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
                Gift Dossier
              </h2>
              <div className="w-full h-px bg-border my-6" />
              <p className="text-xs text-text-muted leading-relaxed mb-6">
                Elevate your selection with our signature botanical packaging and a personalized handwritten note.
              </p>
              
              <label className="flex items-start gap-3 cursor-pointer group mb-4">
                <div className="w-4 h-4 mt-0.5 border border-border group-hover:border-chocolate flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-chocolate mb-1">Add Signature Packaging (₹1,500)</p>
                  <p className="text-xs text-text-muted">Includes a bespoke fragrance card and vintage ribbon.</p>
                </div>
              </label>

              <button className="text-[10px] uppercase tracking-[0.2em] text-text-muted border-b border-border hover:border-chocolate hover:text-chocolate pb-0.5 transition-colors">
                Handwritten Note (Optional)
              </button>
            </div>

            {/* Summary */}
            <div className="border border-border p-8 bg-[#FAF8F5]">
              <h2 className="font-display text-2xl text-chocolate mb-6">Summary</h2>
              <div className="space-y-4 text-xs font-body border-b border-border pb-6 mb-6">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="text-chocolate">{format(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping</span>
                  <span className="text-chocolate">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Taxes (Estimated)</span>
                  <span className="text-chocolate">{format(subtotal * 0.05)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-8">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">Total</span>
                <span className="font-display text-4xl text-chocolate">{format(subtotal * 1.05)}</span>
              </div>
              <Link href="/checkout" className="block w-full bg-chocolate text-ivory text-center py-4 text-[10px] uppercase tracking-[0.2em] hover:bg-deep-brown transition-colors">
                Proceed to Checkout
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* You May Also Like */}
      <div className="px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto pb-32">
        <div className="flex justify-between items-end border-b border-border pb-4 mb-12">
          <h2 className="font-display text-3xl text-chocolate">You May Also Like</h2>
          <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] text-text-muted hover:text-chocolate transition-colors hidden md:block">
            Explore Archives
          </Link>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
