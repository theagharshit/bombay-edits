'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { OrderService } from '@/frontend/services/orderService';
import { OrderRecord } from '@/backend/models/orderModel';
import { generatePlaceholderImage } from '@/frontend/utils/imageUtils';

export function RecentAcquisitions() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAcquisitions() {
      try {
        const data = await OrderService.getOrders({ limit: 3 });
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to load recent acquisitions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAcquisitions();
  }, []);

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div>
        <span
          className="text-[9px] uppercase tracking-[0.2em] text-[#8A817C] block"
          style={{ marginBottom: '32px' }}
        >
          Recent Acquisitions
        </span>
        <div className="py-8 text-center text-[12px] text-[#8A817C]">Loading acquisitions...</div>
      </div>
    );
  }

  // Extract individual items from orders
  const items = orders
    .flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        orderStatus: order.status,
        orderDate: formatDate(order.createdAt),
        orderNumber: order.orderNumber,
      }))
    )
    .slice(0, 3);

  return (
    <div>
      <span
        className="text-[9px] uppercase tracking-[0.2em] text-[#8A817C] block"
        style={{ marginBottom: '32px' }}
      >
        Recent Acquisitions
      </span>

      {items.length === 0 ? (
        <div className="text-[12px] text-[#8A817C] italic">No recent acquisitions found.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {items.map((item, idx) => (
            <div key={`${item.slug}-${idx}`} className="flex items-start gap-5">
              <div className="border border-[#E5DFD5] p-1 bg-white flex-shrink-0">
                <div className="relative w-16 h-16 bg-[#FAF6F0]">
                  <Image
                    src={generatePlaceholderImage(200, 200, item.slug || 'product')}
                    alt={item.name}
                    fill
                    className="object-cover sepia-[0.3]"
                    sizes="64px"
                  />
                </div>
              </div>
              <div className="pt-1">
                <span className="text-[9px] uppercase tracking-[0.15em] text-[#8A817C] mb-1.5 block">
                  {item.orderStatus === 'delivered' ? 'Delivered' : item.orderStatus}:{' '}
                  {item.orderDate}
                </span>
                <h4 className="font-display text-base text-[#4A3025] leading-tight mb-1">
                  <Link href={`/shop/${item.slug}`} className="hover:opacity-80 transition-opacity">
                    {item.name}
                  </Link>
                </h4>
                <span className="text-[11px] text-[#8A817C]">
                  {item.colour} / Size {item.size} / Qty {item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/account/orders"
        className="inline-block bg-[#4A3025] text-white text-[9px] uppercase tracking-[0.2em] hover:bg-[#3A251D] transition-colors"
        style={{ marginTop: '48px', padding: '14px 32px' }}
      >
        View Full Archive
      </Link>
    </div>
  );
}
