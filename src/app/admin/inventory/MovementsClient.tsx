'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { DataTable, type ColumnDef } from '@/app/admin/_components/DataTable';
import { Pagination } from '@/app/admin/_components/Pagination';
import Link from 'next/link';

export type MovementRowItem = {
  id: string;
  createdAt: Date | string;
  productId: string;
  delta: number;
  reason: string;
  referenceId: string | null;
  note: string | null;
  actorId: string | null;
  product: {
    name: string;
    sku: string | null;
  };
  size: {
    sizeCode: string;
  };
};

interface MovementsClientProps {
  data: MovementRowItem[];
  meta: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
}

export function MovementsClient({ data, meta }: MovementsClientProps) {
  const searchParams = useSearchParams();

  const columns: ColumnDef<MovementRowItem>[] = [
    {
      header: 'Date',
      cell: (item: MovementRowItem) => new Date(item.createdAt).toLocaleString(),
    },
    {
      header: 'Product',
      cell: (item: MovementRowItem) => (
        <div className="flex flex-col">
          <Link
            href={`/admin/products/${item.productId}`}
            className="font-medium hover:underline text-[var(--admin-accent)]"
          >
            {item.product.name}
          </Link>
          <span className="text-xs text-gray-500">{item.product.sku}</span>
        </div>
      ),
    },
    { header: 'Size', cell: (item: MovementRowItem) => item.size.sizeCode },
    {
      header: 'Delta',
      cell: (item: MovementRowItem) => {
        const d = item.delta;
        const color = d > 0 ? 'text-green-600' : d < 0 ? 'text-red-600' : 'text-gray-500';
        const sign = d > 0 ? '+' : '';
        return (
          <span className={`font-semibold ${color}`}>
            {sign}
            {d}
          </span>
        );
      },
    },
    { header: 'Reason', accessorKey: 'reason' },
    {
      header: 'Reference',
      cell: (item: MovementRowItem) =>
        item.referenceId ? (
          <Link
            href={`/admin/orders/${item.referenceId}`}
            className="hover:underline text-blue-600"
          >
            {item.referenceId}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    { header: 'Note', accessorKey: 'note' },
    { header: 'Actor', accessorKey: 'actorId' },
  ];

  return (
    <div className="p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-[var(--font-jost)] font-semibold">Movements Ledger</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/inventory"
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
          >
            Back to Stock
          </Link>
          <a
            href={`/api/admin/inventory/export?view=movements&${searchParams.toString()}`}
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
            download
          >
            CSV Export
          </a>
        </div>
      </div>

      <DataTable data={data} columns={columns} keyExtractor={(item: MovementRowItem) => item.id} />

      <Pagination {...meta} />
    </div>
  );
}
