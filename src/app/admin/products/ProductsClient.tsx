'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { formatMoney } from '@/lib/admin/money';
import { Pagination } from '@/app/admin/_components/Pagination';
import { Plus, ExternalLink } from 'lucide-react';

export type ProductListItem = {
  id: string;
  name: string;
  sku: string | null;
  slug: string;
  price: number;
  currency: string;
  status: string;
  category: { name: string } | null;
  images: { url?: string; src?: string }[];
  sizeStock: { stockQuantity: number }[];
};

export type CategoryOption = {
  id: string;
  name: string;
};

type ProductsClientProps = {
  data: ProductListItem[];
  meta: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
  categories: CategoryOption[];
};

export function ProductsClient({ data, meta, categories }: ProductsClientProps) {
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

  const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const currentStatus = searchParams.get('status') || '';

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex bg-gray-100 rounded p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setParam('status', tab.value)}
              className={`px-3 py-1.5 rounded text-sm ${
                currentStatus === tab.value ? 'bg-white shadow font-medium' : 'text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search name, SKU..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-64"
        />
        <select
          value={searchParams.get('category') || ''}
          onChange={(e) => setParam('category', e.target.value)}
          className="px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500 w-12"></th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Product</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">
                Category
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-500 hidden md:table-cell">
                Price
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">
                Stock
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-400">
                  No products found.{' '}
                  <Link href="/admin/products/new" className="text-[var(--admin-accent)] underline">
                    Add the first one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              data.map((product) => {
                const totalStock = product.sizeStock.reduce(
                  (s: number, r) => s + r.stockQuantity,
                  0
                );
                const thumb = product.images[0]?.url || product.images[0]?.src;
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={product.name}
                          width={40}
                          height={52}
                          className="object-cover rounded bg-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-[52px] bg-gray-100 rounded" />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium hover:underline text-[var(--admin-accent)]"
                      >
                        {product.name}
                      </Link>
                      {product.sku && (
                        <div className="text-xs text-gray-400 mt-0.5">SKU: {product.sku}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                      {product.category?.name}
                    </td>
                    <td className="py-3 px-4 text-right font-medium hidden md:table-cell">
                      {formatMoney(product.price, product.currency)}
                    </td>
                    <td className="py-3 px-4 text-center hidden lg:table-cell">
                      <span
                        className={
                          totalStock === 0
                            ? 'text-red-600 font-medium'
                            : totalStock <= 5
                              ? 'text-amber-600 font-medium'
                              : 'text-gray-700'
                        }
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          product.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'DRAFT'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <a
                          href={`/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination {...meta} />
    </div>
  );
}
