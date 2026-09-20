'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Package, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/admin/feedback/StatusBadge';
import { ConfirmDialog } from '@/components/admin/feedback/ConfirmDialog';
import { EmptyState } from '@/components/admin/feedback/EmptyState';
import { slugify } from '@/lib/admin/slug';
import {
  createTaxonomy,
  updateTaxonomy,
  deleteTaxonomy,
  toggleTaxonomyActive,
  type TaxonomyType,
} from '@/app/actions/admin/taxonomy';
import type { TaxonomyRow } from './page';

type Props = { type: TaxonomyType; rows: TaxonomyRow[] };

const LABEL: Record<TaxonomyType, string> = {
  occasions: 'Occasion',
  fabrics: 'Fabric',
  'embroidery-types': 'Embroidery Type',
  colours: 'Colour',
  sizes: 'Size',
};

export function TaxonomyTable({ type, rows }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<TaxonomyRow | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyRow | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (editing === 'new') {
          await createTaxonomy(type, fd);
          showToast(`${LABEL[type]} created.`);
        } else if (editing) {
          await updateTaxonomy(type, editing.id, fd);
          showToast(`${LABEL[type]} updated.`);
        }
        setEditing(null);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteTaxonomy(type, deleteTarget.id);
        showToast(`${LABEL[type]} deleted.`);
        setDeleteTarget(null);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Delete failed.');
        setDeleteTarget(null);
      }
    });
  };

  const handleToggle = (row: TaxonomyRow) => {
    startTransition(async () => {
      await toggleTaxonomyActive(type, row.id, !row.isActive);
      router.refresh();
    });
  };

  const isColour = type === 'colours';
  const isSize = type === 'sizes';
  const hasSlug = type === 'occasions';
  const hasActive = !isColour && !isSize;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-[var(--admin-text)]">{LABEL[type]}s</h1>
          <p className="text-sm text-[var(--admin-text-mute)]">{rows.length} total</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
        >
          <Plus className="w-4 h-4" />
          Add {LABEL[type]}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] text-sm rounded-[var(--admin-radius)]">
          {error}
          <button className="ml-2 underline text-xs" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No ${LABEL[type]}s yet`}
          description={`Create your first ${LABEL[type].toLowerCase()} to make it available in the product editor.`}
          action={
            <button
              onClick={() => setEditing('new')}
              className="px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white"
            >
              Add {LABEL[type]}
            </button>
          }
        />
      ) : (
        <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm" aria-label={`${LABEL[type]}s table`}>
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)]">
                {isColour && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)] w-10">
                    Swatch
                  </th>
                )}
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                  Name
                </th>
                {hasSlug && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                    Slug
                  </th>
                )}
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                  Products
                </th>
                {isSize && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                    Sort Order
                  </th>
                )}
                {hasActive && (
                  <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                    Status
                  </th>
                )}
                <th className="px-3 py-2 w-20" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-surface)] h-[var(--admin-row-h)]"
                >
                  {isColour && (
                    <td className="px-3">
                      <span
                        className="inline-block w-6 h-6 rounded-full border border-[var(--admin-border)]"
                        style={{ background: row.hex ?? '#ccc' }}
                      />
                    </td>
                  )}
                  <td className="px-3 font-medium text-[var(--admin-text)]">{row.name}</td>
                  {hasSlug && (
                    <td className="px-3 text-[var(--admin-text-mute)] font-mono text-xs">
                      {row.slug}
                    </td>
                  )}
                  <td className="px-3">
                    {row.productCount > 0 ? (
                      <a
                        href={`/admin/products?${type.slice(0, -1)}Id=${row.id}`}
                        className="flex items-center gap-1 text-[var(--admin-info)] hover:underline text-xs"
                      >
                        {row.productCount} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[var(--admin-text-faint)] text-xs">0</span>
                    )}
                  </td>
                  {isSize && (
                    <td className="px-3 text-[var(--admin-text-mute)] text-xs">{row.sortOrder}</td>
                  )}
                  {hasActive && (
                    <td className="px-3">
                      <StatusBadge
                        status={row.isActive ? 'ACTIVE' : 'ARCHIVED'}
                        label={row.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>
                  )}
                  <td className="px-3">
                    <div className="flex items-center gap-1 justify-end">
                      {hasActive && (
                        <button
                          onClick={() => handleToggle(row)}
                          title={row.isActive ? 'Deactivate' : 'Activate'}
                          className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                        >
                          {row.isActive ? (
                            <ToggleRight className="w-4 h-4 text-[var(--admin-ok)]" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setEditing(row)}
                        title="Edit"
                        className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(row)}
                        title="Delete"
                        className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-danger)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-over editor */}
      {editing !== null && (
        <div
          className="fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
          aria-label={`Edit ${LABEL[type]}`}
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditing(null)} />
          <div className="relative ml-auto z-10 w-full max-w-md bg-[var(--admin-panel)] h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
              <h2 className="font-semibold text-base">
                {editing === 'new' ? `Add ${LABEL[type]}` : `Edit ${LABEL[type]}`}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] rounded p-1"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <input
                type="hidden"
                name="isActive"
                value={String(editing !== 'new' ? editing.isActive : true)}
              />

              {/* Name */}
              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="name">
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  defaultValue={editing !== 'new' ? editing.name : ''}
                  className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                />
              </div>

              {/* Slug */}
              {!isColour && !isSize && (
                <div>
                  <label
                    className="block text-xs text-[var(--admin-text-mute)] mb-1"
                    htmlFor="slug"
                  >
                    Slug
                  </label>
                  <SlugInputInline
                    id="slug"
                    name="slug"
                    defaultValue={editing !== 'new' ? editing.slug : ''}
                  />
                </div>
              )}

              {/* Description */}
              {!isColour && !isSize && (
                <div>
                  <label
                    className="block text-xs text-[var(--admin-text-mute)] mb-1"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={2}
                    defaultValue={editing !== 'new' ? (editing.description ?? '') : ''}
                    className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                  />
                </div>
              )}

              {/* Colour hex */}
              {isColour && (
                <div>
                  <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="hex">
                    Hex Colour *
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      className="w-10 h-9 border border-[var(--admin-border)] rounded-[var(--admin-radius)] cursor-pointer bg-[var(--admin-bg)] p-0.5"
                      defaultValue={editing !== 'new' ? (editing.hex ?? '#000000') : '#000000'}
                      onChange={(e) => {
                        const txt = document.getElementById('hex-text') as HTMLInputElement;
                        if (txt) txt.value = e.target.value;
                        const hidden = document.getElementById('hex-hidden') as HTMLInputElement;
                        if (hidden) hidden.value = e.target.value;
                      }}
                    />
                    <input
                      id="hex-text"
                      type="text"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      placeholder="#RRGGBB"
                      defaultValue={editing !== 'new' ? (editing.hex ?? '#000000') : '#000000'}
                      className="flex-1 px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                    />
                    <input
                      id="hex-hidden"
                      type="hidden"
                      name="hex"
                      defaultValue={editing !== 'new' ? (editing.hex ?? '#000000') : '#000000'}
                    />
                  </div>
                </div>
              )}

              {/* Sort order */}
              {isSize && (
                <div>
                  <label
                    className="block text-xs text-[var(--admin-text-mute)] mb-1"
                    htmlFor="sortOrder"
                  >
                    Sort Order
                  </label>
                  <input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    min={0}
                    defaultValue={editing !== 'new' ? editing.sortOrder : 0}
                    className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                  />
                </div>
              )}

              {error && <p className="text-xs text-[var(--admin-danger)]">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                >
                  {isPending ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 py-2 text-sm font-medium rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${LABEL[type]}`}
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--admin-text)] text-white text-sm px-4 py-2.5 rounded-[var(--admin-radius)] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// Inline slug input with auto-populate
function SlugInputInline({
  id,
  name,
  defaultValue,
}: {
  id: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <input
      id={id}
      name={name}
      type="text"
      defaultValue={defaultValue}
      placeholder="auto-generated from name"
      className="w-full px-3 py-2 text-sm font-mono border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
      onChange={(e) => {
        e.target.value = slugify(e.target.value);
      }}
    />
  );
}
