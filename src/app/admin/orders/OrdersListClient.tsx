'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DataTable } from '@/app/admin/_components/DataTable';
import { Pagination } from '@/app/admin/_components/Pagination';
import { useDebouncedCallback } from 'use-debounce';
import Link from 'next/link';
import { formatMoney } from '@/lib/admin/money';
import { updateOrderStatus } from '@/app/actions/admin/orders';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

type OrderListProps = {
  data: any[];
  meta: any;
  counts: Record<string, number>;
  zones: any[];
};

export function OrdersListClient({ data, meta, counts, zones }: OrderListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearch = useDebouncedCallback((val: string) => setParam('q', val), 300);

  const statusTab = searchParams.get('status') || 'all';

  const handleBulkAction = async (action: 'confirm' | 'ship') => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    let successCount = 0;
    try {
      for (const id of selectedIds) {
        let tracking = undefined;
        if (action === 'ship') {
           tracking = prompt(`Enter tracking number for Order ${data.find(o => o.id === id)?.orderNumber} (optional)`);
           if (tracking === null) continue; // Cancelled prompt
        }
        await updateOrderStatus(id, action === 'confirm' ? 'confirmed' : 'shipped', 'Bulk update', tracking || undefined);
        successCount++;
      }
      toast.success(`Successfully updated ${successCount} orders`);
      setSelectedIds([]);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update some orders');
    } finally {
      setIsProcessing(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let color = 'bg-gray-100 text-gray-800';
    if (status === 'new') color = 'bg-blue-100 text-blue-800';
    if (status === 'confirmed') color = 'bg-yellow-100 text-yellow-800';
    if (status === 'shipped') color = 'bg-purple-100 text-purple-800';
    if (status === 'delivered') color = 'bg-green-100 text-green-800';
    if (status === 'cancelled') color = 'bg-red-100 text-red-800';
    return <span className={`px-2 py-1 text-[11px] uppercase tracking-wider rounded-full font-medium ${color}`}>{status}</span>;
  };

  const columns = [
    {
      header: 'Order',
      cell: (item: any) => (
        <Link href={`/admin/orders/${item.id}`} className="font-medium hover:underline text-[var(--admin-accent)]">
          {item.orderNumber}
        </Link>
      )
    },
    {
      header: 'Placed',
      cell: (item: any) => (
        <span title={new Date(item.createdAt).toLocaleString()} className="text-gray-600">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </span>
      )
    },
    {
      header: 'Customer',
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.customerFirstName} {item.customerLastName}</span>
          <span className="text-xs text-gray-500">{item.customerEmail}</span>
        </div>
      )
    },
    {
      header: 'Items',
      cell: (item: any) => <span className="text-gray-600">{item.items.length}</span>
    },
    {
      header: 'Total',
      cell: (item: any) => <span className="font-semibold">{formatMoney(item.total, item.currency)}</span>
    },
    {
      header: 'Payment',
      cell: (item: any) => <span className="text-sm">{item.paymentStatus}</span>
    },
    {
      header: 'Status',
      cell: (item: any) => <StatusBadge status={item.status} />
    },
    {
      header: 'Shipping Zone',
      cell: (item: any) => <span className="text-sm">{item.shippingZoneName || '-'}</span>
    }
  ];

  const TABS = ['all', 'new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-[var(--font-jost)] font-semibold">Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`/api/admin/orders/export?${searchParams.toString()}`} className="px-4 py-2 border rounded hover:bg-gray-50 text-sm" download>CSV Export</a>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex bg-gray-100 rounded p-1 overflow-x-auto whitespace-nowrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setParam('status', tab === 'all' ? '' : tab)}
              className={`px-4 py-1.5 rounded text-sm capitalize ${statusTab === tab ? 'bg-white shadow font-medium' : 'text-gray-600 hover:text-black'}`}
            >
              {tab} ({counts[tab] || 0})
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search number, email, name..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-full md:w-64 focus:outline-[var(--admin-focus)]"
        />

        <select
          value={searchParams.get('shippingZone') || ''}
          onChange={(e) => setParam('shippingZone', e.target.value)}
          className="px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        
        <select
          value={searchParams.get('hasTracking') || ''}
          onChange={(e) => setParam('hasTracking', e.target.value)}
          className="px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="">Tracking: Any</option>
          <option value="true">Has Tracking</option>
          <option value="false">No Tracking</option>
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-white border shadow-sm p-4 mb-4 flex items-center justify-between rounded">
          <span className="font-medium text-sm">{selectedIds.length} orders selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('confirm')} disabled={isProcessing} className="px-4 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50">Mark Confirmed</button>
            <button onClick={() => handleBulkAction('ship')} disabled={isProcessing} className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50">Mark Shipped</button>
          </div>
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden md:block">
        <DataTable
          data={data}
          columns={columns}
          keyExtractor={(item) => item.id}
          selectedIds={selectedIds}
          onSelectChange={(id, checked) => setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id))}
          onSelectAll={(checked) => setSelectedIds(checked ? data.map(i => i.id) : [])}
        />
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {data.length === 0 ? (
          <div className="p-8 text-center border rounded bg-white text-gray-500">No orders found.</div>
        ) : (
          data.map(order => (
            <div key={order.id} className="border rounded bg-white p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline text-[var(--admin-accent)] text-lg">
                  {order.orderNumber}
                </Link>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                <span className="font-semibold">{formatMoney(order.total, order.currency)}</span>
              </div>
              <div className="text-sm border-t pt-2 mt-1">
                <div>{order.customerFirstName} {order.customerLastName}</div>
                <div className="text-gray-500 text-xs">{order.customerEmail}</div>
                <div className="text-gray-500 text-xs">{order.items.length} items • {order.paymentStatus}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination {...meta} />
    </div>
  );
}
