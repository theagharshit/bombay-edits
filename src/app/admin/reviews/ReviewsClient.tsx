'use client';
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import Link from 'next/link';
import { format } from 'date-fns';
import { updateReviewStatus, deleteReview } from '@/app/actions/admin/reviews';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/app/admin/_components/ConfirmDialog';
import { Pagination } from '@/app/admin/_components/Pagination';

export type ReviewItem = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  authorName: string;
  authorEmail: string | null;
  status: string;
  isVerifiedPurchase: boolean;
  createdAt: Date | string;
  productId: string;
  product?: { id: string; name: string; slug: string } | null;
};

type ReviewCounts = {
  pending: number;
  approved: number;
  rejected: number;
  all: number;
};

type ReviewsClientProps = {
  data: ReviewItem[];
  meta: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
  counts: ReviewCounts;
};

export function ReviewsClient({ data, meta, counts }: ReviewsClientProps) {
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

  const approve = async (id: string) => {
    try {
      await updateReviewStatus(id, 'APPROVED');
      toast.success('Review approved');
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error approving review');
    }
  };
  const reject = async (id: string) => {
    try {
      await updateReviewStatus(id, 'REJECTED');
      toast.success('Review rejected');
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error rejecting review');
    }
  };
  const remove = async (id: string) => {
    try {
      await deleteReview(id);
      toast.success('Review deleted');
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error deleting review');
    }
  };

  const currentStatus = searchParams.get('status') || '';

  const TABS = [
    { value: '', label: `All (${counts.all})` },
    { value: 'PENDING', label: `Pending (${counts.pending})` },
    { value: 'APPROVED', label: `Approved (${counts.approved})` },
    { value: 'REJECTED', label: `Rejected (${counts.rejected})` },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <h1 className="text-2xl font-semibold mb-8">Reviews</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex bg-gray-100 rounded p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setParam('status', t.value)}
              className={`px-3 py-1.5 rounded text-sm ${currentStatus === t.value ? 'bg-white shadow font-medium' : 'text-gray-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search reviews..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-64"
        />
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="p-16 text-center border rounded bg-white text-gray-400">
            No reviews found.
          </div>
        ) : (
          data.map((review) => (
            <div key={review.id} className="bg-white border rounded shadow-sm p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex text-yellow-400">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </span>
                    {review.title && <span className="font-semibold">{review.title}</span>}
                    <span
                      className={`ml-auto md:ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        review.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : review.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">"{review.body}"</p>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <div>
                      By <strong>{review.authorName}</strong>
                      {review.authorEmail && ` (${review.authorEmail})`} •{' '}
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div>
                      Product:{' '}
                      <Link
                        href={`/admin/products/${review.productId}`}
                        className="text-[var(--admin-accent)] hover:underline"
                      >
                        {review.product?.name}
                      </Link>
                    </div>
                    {review.isVerifiedPurchase && (
                      <div className="text-green-600">✓ Verified Purchase</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {review.status !== 'APPROVED' && (
                    <button
                      onClick={() => approve(review.id)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== 'REJECTED' && (
                    <button
                      onClick={() => reject(review.id)}
                      className="px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50"
                    >
                      Reject
                    </button>
                  )}
                  <ConfirmDialog
                    trigger={
                      <button className="px-3 py-1.5 border border-red-200 text-red-600 rounded text-xs hover:bg-red-50">
                        Delete
                      </button>
                    }
                    title="Delete Review"
                    description="This will permanently delete this review. This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => remove(review.id)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination {...meta} />
    </div>
  );
}
