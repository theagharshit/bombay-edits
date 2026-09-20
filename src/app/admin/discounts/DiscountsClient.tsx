'use client';
import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';
import { formatMoney } from '@/lib/admin/money';
import { toggleDiscount, deleteDiscount, createDiscount } from '@/app/actions/admin/discounts';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/app/admin/_components/ConfirmDialog';
import { Pagination } from '@/app/admin/_components/Pagination';
import { Plus, Tag } from 'lucide-react';
import { DiscountType } from '@prisma/client';

function isExpired(endsAt: Date | string | null | undefined) {
  if (!endsAt) return false;
  return new Date(endsAt) < new Date();
}

export type DiscountItem = {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minSubtotal?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  perCustomerLimit?: number | null;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  isActive: boolean;
};

type DiscountsClientProps = {
  data: DiscountItem[];
  meta: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    total: number;
  };
};

export function DiscountsClient({ data, meta }: DiscountsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED' | 'FREE_SHIPPING',
    value: '',
    minSubtotal: '',
    usageLimit: '',
    perCustomerLimit: '',
    startsAt: new Date().toISOString().slice(0, 10),
    endsAt: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSearch = useDebouncedCallback((v: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (v) p.set('q', v);
    else p.delete('q');
    p.set('page', '1');
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  }, 300);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createDiscount({
        code: form.code,
        type: form.type,
        value: parseInt(form.value),
        minSubtotal: form.minSubtotal ? parseInt(form.minSubtotal) : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : undefined,
        perCustomerLimit: form.perCustomerLimit ? parseInt(form.perCustomerLimit) : undefined,
        startsAt: form.startsAt,
        endsAt: form.endsAt || undefined,
      });
      toast.success('Discount created');
      setShowForm(false);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create discount');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleDiscount(id, active);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to toggle discount');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDiscount(id);
      toast.success('Deleted');
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete discount');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Discounts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New Discount
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border rounded shadow-sm p-6 mb-8 space-y-4"
        >
          <h2 className="text-lg font-semibold mb-4">Create Discount Code</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Code *</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="w-full px-3 py-2 border rounded text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type *</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as 'PERCENT' | 'FIXED' | 'FREE_SHIPPING',
                  }))
                }
                className="w-full px-3 py-2 border rounded text-sm bg-white"
              >
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (NPR)</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
            {form.type !== 'FREE_SHIPPING' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Value * {form.type === 'PERCENT' ? '(%)' : '(minor units)'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === 'PERCENT' ? '20' : '500000'}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Min. Subtotal (minor units)</label>
              <input
                type="number"
                min={0}
                value={form.minSubtotal}
                onChange={(e) => setForm((f) => ({ ...f, minSubtotal: e.target.value }))}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usage Limit</label>
              <input
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Per Customer Limit</label>
              <input
                type="number"
                min={1}
                value={form.perCustomerLimit}
                onChange={(e) => setForm((f) => ({ ...f, perCustomerLimit: e.target.value }))}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Starts At *</label>
              <input
                type="date"
                required
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ends At</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Discount'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Search code..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-64"
        />
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">
                Type & Value
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-500 hidden md:table-cell">
                Usage
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">
                Validity
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  No discounts found.
                </td>
              </tr>
            ) : (
              data.map((d) => {
                const expired = isExpired(d.endsAt);
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        {d.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 hidden md:table-cell">
                      {d.type === 'PERCENT'
                        ? `${d.value}% off`
                        : d.type === 'FIXED'
                          ? `${formatMoney(d.value, 'NPR')} off`
                          : 'Free Shipping'}
                      {d.minSubtotal ? ` · Min ${formatMoney(d.minSubtotal, 'NPR')}` : ''}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 hidden md:table-cell">
                      {d.usageCount}
                      {d.usageLimit ? `/${d.usageLimit}` : ''}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs hidden lg:table-cell">
                      {format(new Date(d.startsAt), 'MMM d')}
                      {d.endsAt
                        ? ` – ${format(new Date(d.endsAt), 'MMM d, yyyy')}`
                        : ' (no expiry)'}
                      {expired && <span className="ml-1 text-red-500">(expired)</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggle(d.id, !d.isActive)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${d.isActive && !expired ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        {d.isActive && !expired ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ConfirmDialog
                        trigger={
                          <button className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">
                            Delete
                          </button>
                        }
                        title="Delete Discount"
                        description={`Are you sure you want to delete the discount code "${d.code}"?`}
                        confirmLabel="Delete"
                        onConfirm={() => handleDelete(d.id)}
                      />
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
