'use client';
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';
import { Pagination } from '@/app/admin/_components/Pagination';
import { Download } from 'lucide-react';

export function NewsletterClient({ data, meta, counts }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (v) p.set(k, v); else p.delete(k);
    p.set('page', '1');
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };
  const handleSearch = useDebouncedCallback((v: string) => setParam('q', v), 300);

  const currentActive = searchParams.get('active') || '';

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">{counts.active} active · {counts.unsubscribed} unsubscribed</p>
        </div>
        <a href="/api/admin/newsletter/export" download className="flex items-center gap-2 px-4 py-2 border rounded text-sm hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex bg-gray-100 rounded p-1">
          {[
            { value: '', label: `All (${counts.all})` },
            { value: 'true', label: `Active (${counts.active})` },
            { value: 'false', label: `Unsubscribed (${counts.unsubscribed})` },
          ].map((t) => (
            <button key={t.value} onClick={() => setParam('active', t.value)}
              className={`px-3 py-1.5 rounded text-sm ${currentActive === t.value ? 'bg-white shadow font-medium' : 'text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Search email..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-64" />
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Source</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Subscribed</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="py-16 text-center text-gray-400">No subscribers found.</td></tr>
            ) : (
              data.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{sub.email}</td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell capitalize">{sub.source}</td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{format(new Date(sub.subscribedAt), 'MMM d, yyyy')}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {sub.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination {...meta} />
    </div>
  );
}
