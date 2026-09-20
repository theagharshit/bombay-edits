'use client';
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';
import { Pagination } from '@/app/admin/_components/Pagination';

export type AuditLogItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  details: unknown;
  createdAt: Date | string;
};

type PaginationMeta = {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
};

type AuditLogClientProps = {
  data: AuditLogItem[];
  meta: PaginationMeta;
  entityTypes: string[];
};

export function AuditLogClient({ data, meta, entityTypes }: AuditLogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (v) p.set(k, v);
    else p.delete(k);
    p.set('page', '1');
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };
  const handleSearch = useDebouncedCallback((v: string) => setParam('q', v), 300);

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-1">Immutable record of all admin actions.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search action, entity ID, user..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-64"
        />
        <select
          value={searchParams.get('entityType') || ''}
          onChange={(e) => setParam('entityType', e.target.value)}
          className="px-3 py-2 border rounded text-sm bg-white"
        >
          <option value="">All Entity Types</option>
          {entityTypes.map((t: string) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Time</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">
                Entity
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">
                User ID
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  No audit log entries.
                </td>
              </tr>
            ) : (
              data.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 align-top">
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                    {format(new Date(log.createdAt), 'MMM d HH:mm')}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{log.action}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <div className="text-xs text-gray-500">{log.entityType}</div>
                    <div className="font-mono text-xs text-gray-700 truncate max-w-[120px]">
                      {log.entityId}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500 hidden lg:table-cell truncate max-w-[100px]">
                    {log.userId}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell max-w-xs">
                    {Boolean(log.details) && (
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
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
