'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  Package,
  Sparkles,
  BookOpen,
  MessageSquare,
  Ruler,
  Truck,
  User,
  HelpCircle,
  Mail,
  ShoppingBag,
  Heart,
  CreditCard,
} from 'lucide-react';
import { products } from '@/data/products';
import { useCurrency } from '@/frontend/context/CurrencyContext';
import { useAuth } from '@/frontend/context/AuthContext';
import { OrderService } from '@/frontend/services/orderService';
import { OrderRecord } from '@/backend/models/orderModel';

export interface HeaderSearchProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

interface DestinationItem {
  id: string;
  title: string;
  category:
    | 'Orders'
    | 'Bespoke'
    | 'Craft'
    | 'Concierge'
    | 'Curations'
    | 'Shop'
    | 'Sizing'
    | 'Policy'
    | 'Account'
    | 'Bag'
    | 'Wishlist'
    | 'FAQ'
    | 'Gazette';
  href: string;
  icon:
    | 'package'
    | 'scissors'
    | 'craft'
    | 'concierge'
    | 'collection'
    | 'bag'
    | 'heart'
    | 'checkout'
    | 'ruler'
    | 'truck'
    | 'portal'
    | 'faq'
    | 'gazette';
  keywords: string[];
}

const ATELIER_DESTINATIONS: DestinationItem[] = [
  {
    id: 'orders',
    title: 'Order History & Tracking',
    category: 'Orders',
    href: '/account/orders',
    icon: 'package',
    keywords: [
      'order',
      'orders',
      'ordering',
      'track',
      'tracking',
      'track order',
      'my orders',
      'my order',
      'status',
      'delivery status',
      'purchases',
      'purchase',
      'tbe',
      'ord',
    ],
  },
  {
    id: 'consultations',
    title: 'Bespoke Styling & Bridal Consultations',
    category: 'Bespoke',
    href: '/consultations',
    icon: 'scissors',
    keywords: [
      'bespoke',
      'custom',
      'bridal',
      'tailor',
      'tailoring',
      'alteration',
      'consultation',
      'appointment',
      'fit',
      'measurement',
      'couture',
      'wedding',
      'stylist',
      'service',
    ],
  },
  {
    id: 'the-craft',
    title: 'Inside Bombay Edits: Artisanal Looms & Heritage',
    category: 'Craft',
    href: '/the-craft',
    icon: 'craft',
    keywords: [
      'craft',
      'heritage',
      'artisan',
      'handloom',
      'zardozi',
      'embroidery',
      'weaver',
      'silk',
      'organza',
      'velvet',
      'fabric',
      'story',
      'about',
      'history',
      'sustainable',
    ],
  },
  {
    id: 'contact',
    title: 'Client Concierge & Direct Support',
    category: 'Concierge',
    href: '/contact',
    icon: 'concierge',
    keywords: [
      'contact',
      'concierge',
      'support',
      'help',
      'phone',
      'email',
      'whatsapp',
      'inquiry',
      'assistance',
      'service',
      'call',
      'chat',
      'reach',
    ],
  },
  {
    id: 'cart',
    title: 'Shopping Bag & Cart',
    category: 'Bag',
    href: '/cart',
    icon: 'bag',
    keywords: ['cart', 'bag', 'basket', 'items', 'checkout', 'my bag', 'shopping cart'],
  },
  {
    id: 'checkout',
    title: 'Express Checkout & Payment',
    category: 'Bag',
    href: '/checkout',
    icon: 'checkout',
    keywords: ['checkout', 'pay', 'payment', 'shipping address', 'buy now'],
  },
  {
    id: 'wishlist',
    title: 'Saved Creations & Wishlist',
    category: 'Wishlist',
    href: '/wishlist',
    icon: 'heart',
    keywords: ['wishlist', 'wish', 'saved', 'favorites', 'likes', 'heart'],
  },
  {
    id: 'kurta-sets',
    title: 'Kurta Sets Collection',
    category: 'Shop',
    href: '/category/kurta-sets',
    icon: 'collection',
    keywords: [
      'kurta',
      'kurtas',
      'kurti',
      'kurta sets',
      'anarkali',
      'straight cut',
      'chanderi set',
    ],
  },
  {
    id: 'co-ord-sets',
    title: 'Co-ord Sets & Indo-Western',
    category: 'Shop',
    href: '/category/co-ord-sets',
    icon: 'collection',
    keywords: ['coord', 'co-ord', 'coords', 'co-ord sets', 'pants set', 'indo western', 'tunic'],
  },
  {
    id: 'occasionwear',
    title: 'Occasionwear & Festive Bridal',
    category: 'Shop',
    href: '/category/occasionwear',
    icon: 'collection',
    keywords: [
      'occasion',
      'occasionwear',
      'wedding',
      'bridal',
      'sangeet',
      'mehendi',
      'haldi',
      'lehenga',
      'sharara',
    ],
  },
  {
    id: 'shop-all',
    title: 'Shop All Creations',
    category: 'Shop',
    href: '/shop',
    icon: 'collection',
    keywords: [
      'shop',
      'store',
      'all',
      'products',
      'clothes',
      'clothing',
      'garments',
      'catalog',
      'collection',
      'browse',
    ],
  },
  {
    id: 'bestsellers',
    title: 'Bestselling Silhouettes & Timeless Pieces',
    category: 'Curations',
    href: '/bestsellers',
    icon: 'collection',
    keywords: [
      'bestseller',
      'bestsellers',
      'popular',
      'trending',
      'top',
      'loved',
      'iconic',
      'best',
    ],
  },
  {
    id: 'size-guide',
    title: 'Atelier Size & Made-to-Measure Guide',
    category: 'Sizing',
    href: '/size-guide',
    icon: 'ruler',
    keywords: [
      'size',
      'sizing',
      'measurement',
      'measurements',
      'measure',
      'chart',
      'guide',
      'dimensions',
      'fit',
      'bust',
      'waist',
      'hip',
    ],
  },
  {
    id: 'policies',
    title: 'Shipping, Delivery & Returns Policies',
    category: 'Policy',
    href: '/policies',
    icon: 'truck',
    keywords: [
      'shipping',
      'delivery',
      'courier',
      'dispatch',
      'return',
      'returns',
      'exchange',
      'refund',
      'policy',
    ],
  },
  {
    id: 'account-portal',
    title: 'Atelier Private Client Portal & Addresses',
    category: 'Account',
    href: '/account',
    icon: 'portal',
    keywords: [
      'account',
      'profile',
      'address',
      'addresses',
      'atelier',
      'login',
      'register',
      'portal',
      'sign in',
      'signin',
    ],
  },
  {
    id: 'faq',
    title: 'Garment Care, Payments & Client FAQs',
    category: 'FAQ',
    href: '/faq',
    icon: 'faq',
    keywords: [
      'faq',
      'faqs',
      'question',
      'questions',
      'care',
      'dry clean',
      'wash',
      'payment',
      'payments',
      'esewa',
      'khalti',
      'cod',
    ],
  },
  {
    id: 'newsletter',
    title: 'The Bombay Edit Gazette & Lookbooks',
    category: 'Gazette',
    href: '/newsletter',
    icon: 'gazette',
    keywords: ['gazette', 'newsletter', 'subscribe', 'vip', 'preview', 'lookbook'],
  },
];

export function HeaderSearch({ isOpen, onOpen, onClose }: HeaderSearchProps) {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const { format } = useCurrency();
  const { customer, isAuthenticated } = useAuth();

  // User's authenticated orders
  const [userOrders, setUserOrders] = useState<OrderRecord[]>([]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);

      // Fetch logged-in user orders securely
      if (isAuthenticated && customer?.email) {
        OrderService.getOrders({ email: customer.email })
          .then((data) => setUserOrders(data || []))
          .catch(() => setUserOrders([]));
      }
    } else {
      setQuery('');
    }
  }, [isOpen, isAuthenticated, customer?.email]);

  // Click outside listener to close search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // ESC key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 1. Matching Destinations & Services
  const matchingDestinations = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);

    return ATELIER_DESTINATIONS.map((dest) => {
      let score = 0;
      const titleLower = dest.title.toLowerCase();

      // Exact keyword match
      if (dest.keywords.some((kw) => kw === q)) score += 200;
      else if (dest.keywords.some((kw) => kw.startsWith(q))) score += 100;
      else if (dest.keywords.some((kw) => kw.includes(q) || q.includes(kw))) score += 70;

      if (titleLower === q) score += 150;
      else if (titleLower.includes(q)) score += 60;

      for (const token of tokens) {
        if (dest.keywords.some((kw) => kw === token)) score += 50;
        else if (dest.keywords.some((kw) => kw.includes(token))) score += 30;
        if (titleLower.includes(token)) score += 25;
      }
      return { dest, score };
    })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.dest)
      .slice(0, 4);
  }, [query]);

  // 2. Authenticated User Matching Specific Orders
  const matchingOrders = useMemo(() => {
    if (!isAuthenticated || !query.trim() || userOrders.length === 0) return [];
    const q = query.toLowerCase().trim();

    return userOrders
      .filter((order) => {
        if (order.orderNumber.toLowerCase().includes(q)) return true;
        if (order.orderId?.toLowerCase().includes(q)) return true;
        if (order.status.toLowerCase().includes(q)) return true;
        if (order.items?.some((item) => item.name.toLowerCase().includes(q))) return true;
        return false;
      })
      .slice(0, 3);
  }, [isAuthenticated, query, userOrders]);

  // 3. Matching Garments
  const matchingProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);

    return products
      .map((product) => {
        let score = 0;
        const nameLower = product.name.toLowerCase();
        const fabricLower = product.fabric.toLowerCase();
        const categoryLower = product.category.toLowerCase();
        const shortDesc = product.shortDescription.toLowerCase();

        if (nameLower === q) score += 120;
        else if (nameLower.startsWith(q)) score += 70;
        else if (nameLower.includes(q)) score += 40;

        for (const token of tokens) {
          if (nameLower.includes(token)) score += 30;
          if (fabricLower.includes(token)) score += 25;
          if (categoryLower.includes(token)) score += 20;
          if (shortDesc.includes(token)) score += 10;
        }

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, 6);
  }, [query]);

  const hasResults =
    matchingProducts.length > 0 || matchingDestinations.length > 0 || matchingOrders.length > 0;

  // On Enter: Navigate ONLY to the search results page
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const renderDestIcon = (icon: DestinationItem['icon']) => {
    switch (icon) {
      case 'package':
        return <Package size={13} className="text-[var(--color-wine)]" />;
      case 'scissors':
        return <Sparkles size={13} className="text-[var(--color-wine)]" />;
      case 'craft':
        return <BookOpen size={13} className="text-[var(--color-wine)]" />;
      case 'concierge':
        return <MessageSquare size={13} className="text-[var(--color-wine)]" />;
      case 'bag':
        return <ShoppingBag size={13} className="text-[var(--color-wine)]" />;
      case 'checkout':
        return <CreditCard size={13} className="text-[var(--color-wine)]" />;
      case 'heart':
        return <Heart size={13} className="text-[var(--color-wine)]" />;
      case 'ruler':
        return <Ruler size={13} className="text-[var(--color-wine)]" />;
      case 'truck':
        return <Truck size={13} className="text-[var(--color-wine)]" />;
      case 'portal':
        return <User size={13} className="text-[var(--color-wine)]" />;
      case 'faq':
        return <HelpCircle size={13} className="text-[var(--color-wine)]" />;
      case 'gazette':
        return <Mail size={13} className="text-[var(--color-wine)]" />;
      default:
        return <ArrowRight size={13} className="text-[var(--color-wine)]" />;
    }
  };

  // When inactive: render the compact header icon button
  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="bg-[#FAF8F5]/95 text-[var(--color-deep-brown)] w-[32px] h-[32px] rounded-full flex items-center justify-center border border-[var(--color-line)]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-deep-brown)] shrink-0 transition-all hover:bg-white hover:border-[var(--color-champagne)] hover:text-[var(--color-wine)] hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
        aria-label="Search Bombay Edits"
      >
        <Search size={14} strokeWidth={1.2} />
      </button>
    );
  }

  // When active: render in-place expanding input + compact anchored live dropdown
  return (
    <div ref={searchContainerRef} className="relative flex items-center z-50">
      {/* In-place input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white border border-[var(--color-wine)]/60 shadow-sm h-[32px] w-[210px] sm:w-[250px] md:w-[280px] px-2.5 gap-1.5 transition-all duration-200 rounded-none"
      >
        <Search size={13} className="text-[var(--color-wine)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search garments, orders..."
          className="w-full bg-transparent text-xs text-[var(--color-ink)] font-body focus:outline-none placeholder:text-[var(--color-muted)]"
          aria-label="Search garments, services, orders"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="text-[var(--color-muted)] hover:text-[var(--color-ink)] p-0.5 cursor-pointer"
            aria-label="Clear text"
          >
            <X size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--color-muted)] hover:text-[var(--color-wine)] p-0.5 border-l border-[var(--color-line)] pl-1.5 cursor-pointer"
          aria-label="Close search"
          title="Close (ESC)"
        >
          <X size={13} />
        </button>
      </form>

      {/* Compact Anchored Live Dropdown */}
      {query.trim().length > 0 && (
        <div className="absolute right-0 top-full mt-2 w-[300px] sm:w-[350px] md:w-[390px] max-h-[380px] bg-[#FAF8F5] border border-[var(--color-line)] shadow-xl z-50 overflow-y-auto flex flex-col rounded-none animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Subtle gold accent header line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[var(--color-wine)] via-[#D4AF37] to-[var(--color-wine)] shrink-0" />

          <div className="p-3 space-y-3.5 flex-1">
            {/* 1. Garments (ALWAYS SHOWN FIRST) */}
            {matchingProducts.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-wine)] font-semibold flex items-center gap-1 mb-1.5">
                  <ShoppingBag size={12} />
                  Garments ({matchingProducts.length})
                </span>
                <div className="space-y-1.5">
                  {matchingProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-2.5 p-1.5 bg-white border border-[var(--color-line)] hover:border-[var(--color-wine)] transition-colors rounded-none group cursor-pointer"
                    >
                      <div className="relative w-10 h-13 bg-[#F5F2EB] shrink-0 overflow-hidden">
                        <Image
                          src={product.images[0]?.src || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-display text-[var(--color-ink)] group-hover:text-[var(--color-wine)] transition-colors truncate">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider truncate">
                          {product.fabric} • {product.category.replace('-', ' ')}
                        </div>
                        <div className="text-[11px] font-medium text-[var(--color-ink)] mt-0.5">
                          {format(product.price)}
                        </div>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-[var(--color-muted)] group-hover:text-[var(--color-wine)] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5 opacity-0 group-hover:opacity-100"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Authenticated User Matching Specific Orders */}
            {isAuthenticated && matchingOrders.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-wine)] font-semibold flex items-center gap-1 mb-1.5">
                  <Package size={12} />
                  Your Orders ({matchingOrders.length})
                </span>
                <div className="space-y-1.5">
                  {matchingOrders.map((order) => (
                    <Link
                      key={order.orderId || order.orderNumber}
                      href={`/account/orders/${order.orderId || order.orderNumber}`}
                      onClick={onClose}
                      className="block p-2 bg-white border border-[var(--color-line)] hover:border-[var(--color-wine)] transition-colors rounded-none cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-semibold text-[var(--color-ink)]">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-stone-100 text-stone-700">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--color-muted)] truncate">
                        {order.items?.map((i) => i.name).join(', ')}
                      </div>
                      <div className="text-[11px] font-medium text-[var(--color-ink)] mt-1">
                        Total: {format(order.total)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Destinations & Services (Orders, Cart, Wishlist, Bespoke, Craft, Contact, etc.) */}
            {matchingDestinations.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-semibold block mb-1.5">
                  Destinations & Services
                </span>
                <div className="space-y-1">
                  {matchingDestinations.map((dest) => (
                    <Link
                      key={dest.id}
                      href={dest.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-2 bg-white border border-[var(--color-line)] hover:border-[var(--color-wine)] transition-colors rounded-none group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-none bg-[var(--color-sand)]/60 flex items-center justify-center shrink-0">
                          {renderDestIcon(dest.icon)}
                        </div>
                        <div className="truncate">
                          <span className="text-[9px] uppercase tracking-wider text-[var(--color-wine)] font-semibold mr-1.5">
                            [{dest.category}]
                          </span>
                          <span className="text-xs text-[var(--color-ink)] font-medium">
                            {dest.title}
                          </span>
                        </div>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-[var(--color-muted)] group-hover:text-[var(--color-wine)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 4. No Results Found */}
            {!hasResults && (
              <div className="text-center py-5 px-3 text-xs text-[var(--color-muted)]">
                <p className="mb-2">No garments or destinations match &ldquo;{query}&rdquo;.</p>
                <Link
                  href="/shop"
                  onClick={onClose}
                  className="text-[11px] text-[var(--color-wine)] uppercase tracking-wider underline hover:text-[var(--color-ink)] cursor-pointer"
                >
                  Browse all creations →
                </Link>
              </div>
            )}
          </div>

          {/* Compact Dropdown Footer */}
          {hasResults && (
            <div className="px-3 py-2 bg-white border-t border-[var(--color-line)] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
              <span>Press Enter for search results</span>
              <button
                type="button"
                onClick={handleSubmit}
                className="text-[var(--color-wine)] font-medium hover:underline cursor-pointer"
              >
                View all results →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Backward compatibility alias for any existing imports
export const SearchOverlay = HeaderSearch;
