'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DataTable } from '@/app/admin/_components/DataTable';
import { Pagination } from '@/app/admin/_components/Pagination';
import { useDebouncedCallback } from 'use-debounce';
import Link from 'next/link';
import { formatMoney } from '@/lib/admin/money';
import { formatDistanceToNow, format } from 'date-fns';

type CustomersListProps = {
  data: any[];
  meta: any;
  zones: any[];
};

export function CustomersClient({ data, meta, zones }: CustomersListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearch = useDebouncedCallback((val: string) => setParam('q', val), 300);

  const columns = [
    {
      header: 'Customer',
      cell: (item: any) => (
        <div className="flex flex-col">
          <Link href={`/admin/customers/${item.id}`} className="font-medium hover:underline text-[var(--admin-accent)]">
            {item.firstName} {item.lastName}
          </Link>
          <span className="text-xs text-gray-500">{item.email}</span>
        </div>
      )
    },
    {
      header: 'Phone',
      cell: (item: any) => <span className="text-sm">{item.phone || '-'}</span>
    },
    {
      header: 'Orders',
      cell: (item: any) => <span className="text-gray-600 font-medium">{item.orderCount}</span>
    },
    {
      header: 'Lifetime Value',
      cell: (item: any) => <span className="font-semibold">{formatMoney(item.ltv, 'NPR')}</span>
    },
    {
      header: 'Last Order',
      cell: (item: any) => (
        <span className="text-gray-600 text-sm">
          {item.lastOrderDate ? formatDistanceToNow(new Date(item.lastOrderDate), { addSuffix: true }) : 'Never'}
        </span>
      )
    },
    {
      header: 'Joined',
      cell: (item: any) => (
        <span title={new Date(item.createdAt).toLocaleString()} className="text-sm text-gray-600">
          {format(new Date(item.createdAt), 'MMM d, yyyy')}
        </span>
      )
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-[var(--font-jost)] font-semibold">Customers</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV export stub for now, matching the standard API route pattern */}
          <a href={`/api/admin/customers/export?${searchParams.toString()}`} className="px-4 py-2 border rounded hover:bg-gray-50 text-sm" download>CSV Export</a>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-full md:w-64 focus:outline-[var(--admin-focus)]"
        />

        <select
          value={searchParams.get('sort') || 'joined_desc'}
          onChange={(e) => setParam('sort', e.target.value)}
          className="px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="joined_desc">Newest First</option>
          <option value="joined_asc">Oldest First</option>
          <option value="ltv_desc">Highest LTV</option>
          <option value="orders_desc">Most Orders</option>
          <option value="last_order_desc">Recent Order</option>
        </select>

        <select
          value={searchParams.get('hasOrders') || ''}
          onChange={(e) => setParam('hasOrders', e.target.value)}
          className="px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="">Orders: Any</option>
          <option value="true">Has Orders</option>
          <option value="false">No Orders</option>
        </select>

        <select
          value={searchParams.get('shippingZone') || ''}
          onChange={(e) => setParam('shippingZone', e.target.value)}
          className="px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="">Any Zone</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </div>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(item: any) => item.id}
      />

      <Pagination {...meta} />
    </div>
  );
}
