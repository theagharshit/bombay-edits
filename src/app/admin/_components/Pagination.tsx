'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
}

export function Pagination({ page, totalPages, hasNext, hasPrev, total }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between py-4 border-t border-[var(--admin-border)] mt-4">
      <div className="text-[14px] text-[var(--admin-text-mute)]">
        Showing page {page} of {totalPages} ({total} total records)
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={!hasPrev}
          className="px-3 py-1 border border-[var(--admin-border-str)] rounded text-[14px] disabled:opacity-50 hover:bg-[#f5f5f4] transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={!hasNext}
          className="px-3 py-1 border border-[var(--admin-border-str)] rounded text-[14px] disabled:opacity-50 hover:bg-[#f5f5f4] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
