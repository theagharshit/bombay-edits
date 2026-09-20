'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { DataTable, type ColumnDef } from '@/app/admin/_components/DataTable';
import { Pagination } from '@/app/admin/_components/Pagination';
import { updateStockQuantity, updateLowStockThreshold } from '@/app/actions/admin/inventory';
import { useDebouncedCallback } from 'use-debounce';
import Image from 'next/image';
import Link from 'next/link';
import { CsvImportDialog } from './CsvImportDialog';

export type StockRowItem = {
  productId: string;
  sizeId: string;
  stockQuantity: number;
  reservedQuantity: number;
  product: {
    id: string;
    name: string;
    sku: string | null;
    lowStockThreshold: number;
    images?: { url?: string; src?: string }[];
  };
  size: {
    sizeCode: string;
  };
};

interface InventoryClientProps {
  data: StockRowItem[];
  meta: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
  allCount: number;
}

export function InventoryClient({ data, meta, allCount }: InventoryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const stateTab = searchParams.get('state') || 'ALL';

  const handleSearch = useDebouncedCallback((val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set('search', val);
    else params.delete('search');
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  const handleStateChange = (state: string) => {
    const params = new URLSearchParams(searchParams);
    if (state === 'ALL') params.delete('state');
    else params.set('state', state);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const updateQuantity = async (
    productId: string,
    sizeId: string,
    newQty: number,
    currentQty: number
  ) => {
    if (newQty === currentQty) return;
    const delta = newQty - currentQty;
    try {
      await updateStockQuantity(productId, sizeId, delta, 'MANUAL_ADJUSTMENT', 'Inline edit');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to update stock');
      router.refresh();
    }
  };

  const updateThreshold = async (productId: string, newThreshold: number) => {
    try {
      await updateLowStockThreshold(productId, newThreshold);
    } catch {
      alert('Failed to update threshold');
    }
  };

  const columns: ColumnDef<StockRowItem>[] = [
    {
      header: 'Product',
      cell: (item: StockRowItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden">
            {item.product.images?.[0]?.url && (
              <Image
                src={item.product.images[0].url}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col">
            <Link
              href={`/admin/products/${item.product.id}`}
              className="font-medium hover:underline text-[var(--admin-accent)]"
            >
              {item.product.name}
            </Link>
            <span className="text-xs text-gray-500">{item.product.sku}</span>
          </div>
        </div>
      ),
    },
    { header: 'Size', cell: (item: StockRowItem) => item.size.sizeCode },
    {
      header: 'On Hand',
      cell: (item: StockRowItem) => (
        <input
          type="number"
          defaultValue={item.stockQuantity}
          onBlur={(e) =>
            updateQuantity(
              item.productId,
              item.sizeId,
              parseInt(e.target.value, 10),
              item.stockQuantity
            )
          }
          className="w-20 px-2 py-1 border rounded"
        />
      ),
    },
    { header: 'Reserved', accessorKey: 'reservedQuantity' },
    {
      header: 'Available',
      cell: (item: StockRowItem) => item.stockQuantity - item.reservedQuantity,
    },
    {
      header: 'Threshold',
      cell: (item: StockRowItem) => (
        <input
          type="number"
          defaultValue={item.product.lowStockThreshold}
          onBlur={(e) => updateThreshold(item.productId, parseInt(e.target.value, 10))}
          className="w-20 px-2 py-1 border rounded text-xs"
        />
      ),
    },
    {
      header: 'State',
      cell: (item: StockRowItem) => {
        const qty = item.stockQuantity;
        const thresh = item.product.lowStockThreshold;
        if (qty <= 0)
          return (
            <span className="px-2 py-1 text-xs uppercase bg-red-100 text-red-800 rounded-full font-medium">
              Out of Stock
            </span>
          );
        if (qty <= thresh)
          return (
            <span className="px-2 py-1 text-xs uppercase bg-orange-100 text-orange-800 rounded-full font-medium">
              Low Stock
            </span>
          );
        return (
          <span className="px-2 py-1 text-xs uppercase bg-green-100 text-green-800 rounded-full font-medium">
            In Stock
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-[var(--font-jost)] font-semibold">Inventory</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/inventory?view=movements"
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
          >
            View Ledger
          </Link>
          <a
            href={`/api/admin/inventory/export?${searchParams.toString()}`}
            className="px-4 py-2 border rounded hover:bg-gray-50 text-sm"
            download
          >
            CSV Export
          </a>
          <CsvImportDialog />
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => handleStateChange('ALL')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${stateTab === 'ALL' ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          All ({allCount})
        </button>
        <button
          onClick={() => handleStateChange('LOW')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${stateTab === 'LOW' ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Low Stock
        </button>
        <button
          onClick={() => handleStateChange('OUT')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${stateTab === 'OUT' ? 'border-[var(--admin-accent)] text-[var(--admin-accent)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Out of Stock
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <input
          type="search"
          placeholder="Search product or SKU..."
          defaultValue={searchParams.get('search') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded"
        />
      </div>

      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(item: StockRowItem) => `${item.productId}-${item.sizeId}`}
        selectedIds={selectedIds}
        onSelectChange={(id: string, checked: boolean) =>
          setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
        }
        onSelectAll={(checked: boolean) =>
          setSelectedIds(checked ? data.map((i) => `${i.productId}-${i.sizeId}`) : [])
        }
      />

      <Pagination {...meta} />
    </div>
  );
}
