'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/frontend/components/ui/Badge';
import { Button } from '@/frontend/components/ui/Button';
import { generatePlaceholderImage } from '@/frontend/utils/imageUtils';

interface OrderItemPreview {
  id: string;
  slug: string;
  name: string;
  size: string;
  colour: string;
  quantity: number;
  price: string;
  image: string;
}

interface OrderHistoryRecord {
  orderNumber: string;
  date: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  statusLabel: string;
  trackingNumber?: string;
  total: string;
  shippingAddress: string;
  items: OrderItemPreview[];
}

export default function OrdersPage() {
  const [orders] = useState<OrderHistoryRecord[]>([
    {
      orderNumber: 'TBE-2026-89412',
      date: 'Aug 28, 2026',
      status: 'shipped',
      statusLabel: 'In Transit',
      trackingNumber: 'BLUEDART-8821941',
      total: 'Rs. 46,500',
      shippingAddress: 'Worli Sea Face, Mumbai, 400018',
      items: [
        {
          id: 'ks-001',
          slug: 'chandni-chanderi-set',
          name: 'Chandni Chanderi set',
          size: 'M',
          colour: 'Ivory',
          quantity: 1,
          price: 'Rs. 14,500',
          image: generatePlaceholderImage(300, 400, 'chandni'),
        },
        {
          id: 'ow-004',
          slug: 'mehr-sangeet-set',
          name: 'Mehr sangeet set',
          size: 'M',
          colour: 'Emerald',
          quantity: 1,
          price: 'Rs. 32,000',
          image: generatePlaceholderImage(300, 400, 'sangeet'),
        },
      ],
    },
    {
      orderNumber: 'TBE-2026-41203',
      date: 'Jun 14, 2026',
      status: 'delivered',
      statusLabel: 'Delivered',
      total: 'Rs. 18,500',
      shippingAddress: 'Worli Sea Face, Mumbai, 400018',
      items: [
        {
          id: 'ks-002',
          slug: 'roshni-silk-set',
          name: 'Roshni silk set',
          size: 'S',
          colour: 'Dusty Rose',
          quantity: 1,
          price: 'Rs. 18,500',
          image: generatePlaceholderImage(300, 400, 'roshni'),
        },
      ],
    },
  ]);

  return (
    <div className="container-site section-padding max-w-4xl mx-auto font-body">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-taupe mb-8">
        <Link href="/account" className="hover:text-dark-espresso transition-colors">
          Account
        </Link>
        <span>/</span>
        <span className="text-dark-espresso">Order History</span>
      </div>

      <div className="border-b border-beige-line pb-6 mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-dark-espresso mb-1">Order History</h1>
        <p className="text-[13px] text-chocolate-brown">
          Review past couture acquisitions, track consignments, and access invoices.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-cream border border-beige-line p-8">
          <p className="font-display text-xl text-dark-espresso mb-2">No Past Orders</p>
          <p className="text-[13px] text-chocolate-brown mb-6">
            You haven't placed any orders with The Bombay Edit yet.
          </p>
          <Link href="/shop">
            <Button variant="primary" size="sm">
              Explore The Collection
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.orderNumber}
              className="border border-beige-line bg-cream/40 p-6 md:p-8"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-beige-line pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-display text-xl text-dark-espresso font-medium">
                      {order.orderNumber}
                    </span>
                    <Badge variant={order.status === 'delivered' ? 'muted' : 'gold'}>
                      {order.statusLabel}
                    </Badge>
                  </div>
                  <span className="text-[12px] text-muted-taupe">
                    Placed on {order.date} • Ships to {order.shippingAddress}
                  </span>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-taupe block">
                    Total Amount
                  </span>
                  <span className="font-display text-xl text-dark-espresso font-medium">
                    {order.total}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-cream/60 border border-beige-line/50 p-4"
                  >
                    <div className="relative w-16 h-20 bg-sand flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="font-display text-base text-dark-espresso hover:text-champagne-gold transition-colors truncate block"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[12px] text-chocolate-brown block">
                        Size: {item.size} • Colour: {item.colour} • Qty: {item.quantity}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[13px] font-medium text-dark-espresso">
                        {item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-beige-line">
                {order.trackingNumber ? (
                  <div className="text-[12px] text-chocolate-brown">
                    <span>Tracking: </span>
                    <span className="font-mono text-dark-espresso">{order.trackingNumber}</span>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <Link href="/contact">
                    <Button variant="ghost" size="sm">
                      Need Assistance?
                    </Button>
                  </Link>
                  <Link href={`/shop/${order.items[0]?.slug}`}>
                    <Button variant="secondary" size="sm">
                      Reorder Item
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
