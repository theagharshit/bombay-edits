'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/admin/money';
import { upsertShippingZone, deleteShippingZone } from '@/app/actions/admin/shipping';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/app/admin/_components/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

type Zone = {
  id: string;
  zone: string;
  label: string;
  description: string | null;
  rate: number;
  freeAbove: number | null;
  estimatedDays: string;
};
type ShippingClientProps = { zones: Zone[] };

const EMPTY_FORM = {
  id: '',
  zone: '',
  label: '',
  description: '',
  rate: '',
  freeAbove: '',
  estimatedDays: '',
};

export function ShippingClient({ zones }: ShippingClientProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<typeof EMPTY_FORM | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => setEditing({ ...EMPTY_FORM });
  const openEdit = (z: Zone) =>
    setEditing({
      id: z.id,
      zone: z.zone,
      label: z.label,
      description: z.description || '',
      rate: String(z.rate),
      freeAbove: z.freeAbove ? String(z.freeAbove) : '',
      estimatedDays: z.estimatedDays,
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await upsertShippingZone({
        id: editing.id || undefined,
        zone: editing.zone,
        label: editing.label,
        description: editing.description,
        rate: parseInt(editing.rate),
        freeAbove: editing.freeAbove ? parseInt(editing.freeAbove) : undefined,
        estimatedDays: editing.estimatedDays,
      });
      toast.success('Saved');
      setEditing(null);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error saving shipping zone');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShippingZone(id);
      toast.success('Deleted');
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error deleting shipping zone');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Shipping Zones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure shipping rates and delivery estimates.
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add Zone
        </button>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="bg-white border rounded shadow-sm p-6 mb-8 space-y-4"
        >
          <h2 className="text-lg font-semibold">{editing.id ? 'Edit Zone' : 'New Zone'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zone Code * (unique slug)</label>
              <input
                required
                value={editing.zone}
                onChange={(e) => setEditing((f) => (f ? { ...f, zone: e.target.value } : f))}
                placeholder="inside-valley"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label *</label>
              <input
                required
                value={editing.label}
                onChange={(e) => setEditing((f) => (f ? { ...f, label: e.target.value } : f))}
                placeholder="Inside Kathmandu Valley"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rate (NPR minor units) *</label>
              <input
                type="number"
                required
                min={0}
                value={editing.rate}
                onChange={(e) => setEditing((f) => (f ? { ...f, rate: e.target.value } : f))}
                placeholder="20000"
                className="w-full px-3 py-2 border rounded text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">e.g. 20000 = Rs. 200.00</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Free Shipping Above (minor units)
              </label>
              <input
                type="number"
                min={0}
                value={editing.freeAbove}
                onChange={(e) => setEditing((f) => (f ? { ...f, freeAbove: e.target.value } : f))}
                placeholder="Optional"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Delivery *</label>
              <input
                required
                value={editing.estimatedDays}
                onChange={(e) =>
                  setEditing((f) => (f ? { ...f, estimatedDays: e.target.value } : f))
                }
                placeholder="2–3 business days"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                value={editing.description}
                onChange={(e) => setEditing((f) => (f ? { ...f, description: e.target.value } : f))}
                placeholder="Optional description"
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
              {saving ? 'Saving...' : 'Save Zone'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {zones.length === 0 ? (
          <div className="p-16 text-center border rounded bg-white text-gray-400">
            No shipping zones configured.
          </div>
        ) : (
          zones.map((z) => (
            <div
              key={z.id}
              className="bg-white border rounded shadow-sm p-5 flex items-start justify-between gap-4"
            >
              <div>
                <div className="font-semibold">{z.label}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">{z.zone}</div>
                {z.description && <div className="text-sm text-gray-600 mt-1">{z.description}</div>}
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  <span>
                    <strong>Rate:</strong> {formatMoney(z.rate, 'NPR')}
                  </span>
                  {z.freeAbove && (
                    <span>
                      <strong>Free above:</strong> {formatMoney(z.freeAbove, 'NPR')}
                    </span>
                  )}
                  <span>
                    <strong>Delivery:</strong> {z.estimatedDays}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(z)}
                  className="p-1.5 border rounded hover:bg-gray-50"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <ConfirmDialog
                  trigger={
                    <button className="p-1.5 border border-red-200 rounded hover:bg-red-50 text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  }
                  title="Delete Shipping Zone"
                  description={`Delete "${z.label}"? Orders associated with it will keep their zone name but may lose the rate reference.`}
                  confirmLabel="Delete"
                  onConfirm={() => handleDelete(z.id)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
