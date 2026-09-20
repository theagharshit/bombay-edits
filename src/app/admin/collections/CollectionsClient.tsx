'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Star, Package, ExternalLink, X, Search } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/feedback/ConfirmDialog';
import { EmptyState } from '@/components/admin/feedback/EmptyState';
import { StatusBadge } from '@/components/admin/feedback/StatusBadge';
import { slugify } from '@/lib/admin/slug';
import {
  createCollection,
  updateCollection,
  deleteCollection,
  addProductToCollection,
  removeProductFromCollection,
  toggleCollectionFeatured,
} from '@/app/actions/admin/collection';
import type { CollectionRow } from './page';

type Props = { collections: CollectionRow[] };

type CollectionMember = {
  productId: string;
  product: { id: string; name: string; slug: string; price: number; images: { src: string }[] };
};

type EditorTab = 'details' | 'products';

export function CollectionsClient({ collections }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<CollectionRow | 'new' | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('details');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [members, setMembers] = useState<CollectionMember[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<CollectionMember['product'][]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CollectionRow | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load members when editing an existing collection
  useEffect(() => {
    if (editingId) {
      fetch(`/api/admin/collections/${editingId}/products`)
        .then((r) => r.json())
        .then((data) => setMembers(data.products ?? []))
        .catch(() => {});
    }
  }, [editingId]);

  // Search products
  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.products ?? []);
    } catch {
      setSearchResults([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(productSearch), 300);
    return () => clearTimeout(t);
  }, [productSearch, searchProducts]);

  const openEditor = (col: CollectionRow | 'new') => {
    setEditing(col);
    setActiveTab('details');
    setProductSearch('');
    setSearchResults([]);
    setMembers([]);
    if (col !== 'new') {
      setEditingId(col.id);
    } else {
      setEditingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (editing === 'new') {
          await createCollection(fd);
          setToast('Collection created.');
        } else if (editing) {
          await updateCollection(editing.id, fd);
          setToast('Collection updated.');
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
        await deleteCollection(deleteTarget.id);
        setToast('Collection deleted.');
        setDeleteTarget(null);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Delete failed.');
        setDeleteTarget(null);
      }
    });
  };

  const handleToggleFeatured = (col: CollectionRow) => {
    startTransition(async () => {
      await toggleCollectionFeatured(col.id, !col.isFeatured);
      router.refresh();
    });
  };

  const handleAddProduct = (product: CollectionMember['product']) => {
    if (!editingId) return;
    startTransition(async () => {
      await addProductToCollection(editingId, product.id);
      setMembers((prev) =>
        prev.some((m) => m.productId === product.id)
          ? prev
          : [...prev, { productId: product.id, product }]
      );
      setProductSearch('');
      setSearchResults([]);
    });
  };

  const handleRemoveProduct = (productId: string) => {
    if (!editingId) return;
    startTransition(async () => {
      await removeProductFromCollection(editingId, productId);
      setMembers((prev) => prev.filter((m) => m.productId !== productId));
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--admin-text-mute)]">{collections.length} collections</p>
        <button
          onClick={() => openEditor('new')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
        >
          <Plus className="w-4 h-4" />
          Add Collection
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] text-sm rounded-[var(--admin-radius)]">
          {error}{' '}
          <button className="ml-2 underline text-xs" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {collections.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No collections yet"
          description="Collections let you merchandise curated edits like Festive Edit or Signature."
          action={
            <button
              onClick={() => openEditor('new')}
              className="px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white"
            >
              Add Collection
            </button>
          }
        />
      ) : (
        <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)]">
                <th className="px-3 py-2 w-10" />
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                  Slug
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                  Products
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                  Featured
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--admin-text-mute)]">
                  Status
                </th>
                <th className="px-3 py-2 w-24" />
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr
                  key={col.id}
                  className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-surface)] h-[var(--admin-row-h)]"
                >
                  <td className="px-3">
                    {col.image ? (
                      <Image
                        src={col.image}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-[var(--admin-surface)] border border-[var(--admin-border)]" />
                    )}
                  </td>
                  <td className="px-3 font-medium text-[var(--admin-text)]">{col.name}</td>
                  <td className="px-3 font-mono text-xs text-[var(--admin-text-mute)]">
                    {col.slug}
                  </td>
                  <td className="px-3">
                    <a
                      href={`/admin/products?collectionId=${col.id}`}
                      className="flex items-center gap-1 text-xs text-[var(--admin-info)] hover:underline"
                    >
                      {col._count.productCollections} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-3">
                    <button
                      onClick={() => handleToggleFeatured(col)}
                      title={col.isFeatured ? 'Unfeature' : 'Feature'}
                      className="focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] rounded"
                    >
                      <Star
                        className={`w-4 h-4 ${col.isFeatured ? 'fill-[var(--admin-warn)] text-[var(--admin-warn)]' : 'text-[var(--admin-border-str)]'}`}
                      />
                    </button>
                  </td>
                  <td className="px-3">
                    <StatusBadge
                      status={col.isActive ? 'ACTIVE' : 'ARCHIVED'}
                      label={col.isActive ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEditor(col)}
                        title="Edit"
                        className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(col)}
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
          aria-label="Edit Collection"
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditing(null)} />
          <div className="relative ml-auto z-10 w-full max-w-lg bg-[var(--admin-panel)] h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] flex-shrink-0">
              <h2 className="font-semibold text-base">
                {editing === 'new' ? 'Add Collection' : 'Edit Collection'}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] rounded p-1"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--admin-border)] px-6 flex-shrink-0">
              {(['details', 'products'] as EditorTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={tab === 'products' && editing === 'new'}
                  className={`py-2.5 mr-4 text-sm font-medium border-b-2 transition-colors capitalize focus:outline-none disabled:opacity-40 ${
                    activeTab === tab
                      ? 'border-[var(--admin-accent)] text-[var(--admin-text)]'
                      : 'border-transparent text-[var(--admin-text-mute)] hover:text-[var(--admin-text)]'
                  }`}
                >
                  {tab}
                  {tab === 'products' && editing !== 'new' && (
                    <span className="ml-1.5 text-xs text-[var(--admin-text-faint)]">
                      ({members.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'details' && (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <input
                    type="hidden"
                    name="isActive"
                    value={editing !== 'new' ? String(editing.isActive) : 'true'}
                  />
                  <input
                    type="hidden"
                    name="isFeatured"
                    value={editing !== 'new' ? String(editing.isFeatured) : 'false'}
                  />

                  <div>
                    <label
                      className="block text-xs text-[var(--admin-text-mute)] mb-1"
                      htmlFor="col-name"
                    >
                      Name *
                    </label>
                    <input
                      id="col-name"
                      name="name"
                      required
                      defaultValue={editing !== 'new' ? editing.name : ''}
                      className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[var(--admin-text-mute)] mb-1"
                      htmlFor="col-slug"
                    >
                      Slug
                    </label>
                    <input
                      id="col-slug"
                      name="slug"
                      placeholder="auto-generated"
                      defaultValue={editing !== 'new' ? editing.slug : ''}
                      className="w-full px-3 py-2 text-sm font-mono border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                      onChange={(e) => {
                        e.target.value = slugify(e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[var(--admin-text-mute)] mb-1"
                      htmlFor="col-desc"
                    >
                      Description
                    </label>
                    <textarea
                      id="col-desc"
                      name="description"
                      rows={2}
                      defaultValue={editing !== 'new' ? (editing.description ?? '') : ''}
                      className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                    />
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        value="true"
                        defaultChecked={editing !== 'new' && editing.isFeatured}
                        className="rounded focus:ring-[var(--admin-focus)]"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        value="true"
                        defaultChecked={editing === 'new' || editing.isActive}
                        className="rounded focus:ring-[var(--admin-focus)]"
                      />
                      Active
                    </label>
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[var(--admin-text-mute)] mb-1"
                      htmlFor="col-sort"
                    >
                      Sort Order
                    </label>
                    <input
                      id="col-sort"
                      name="sortOrder"
                      type="number"
                      min={0}
                      defaultValue={editing !== 'new' ? editing.sortOrder : 0}
                      className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[var(--admin-text-mute)] mb-1"
                      htmlFor="col-meta-title"
                    >
                      Meta Title (≤60)
                    </label>
                    <input
                      id="col-meta-title"
                      name="metaTitle"
                      maxLength={60}
                      defaultValue={editing !== 'new' ? (editing.metaTitle ?? '') : ''}
                      className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs text-[var(--admin-text-mute)] mb-1"
                      htmlFor="col-meta-desc"
                    >
                      Meta Description (≤160)
                    </label>
                    <textarea
                      id="col-meta-desc"
                      name="metaDescription"
                      maxLength={160}
                      rows={2}
                      defaultValue={editing !== 'new' ? (editing.metaDescription ?? '') : ''}
                      className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-[var(--admin-danger)]" role="alert">
                      {error}
                    </p>
                  )}

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
              )}

              {activeTab === 'products' && editing !== 'new' && (
                <div className="p-6 space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-faint)]" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by name or SKU…"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                    />
                  </div>

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className="border border-[var(--admin-border)] rounded-[var(--admin-radius)] overflow-hidden">
                      {searchResults.map((p) => {
                        const isMember = members.some((m) => m.productId === p.id);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--admin-surface)] border-b border-[var(--admin-border)] last:border-0"
                          >
                            {p.images[0] && (
                              <Image
                                src={p.images[0].src}
                                alt=""
                                width={32}
                                height={32}
                                unoptimized
                                className="w-8 h-8 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <span className="flex-1 text-sm">{p.name}</span>
                            <button
                              onClick={() => handleAddProduct(p)}
                              disabled={isMember}
                              className="text-xs px-2 py-1 rounded border border-[var(--admin-border)] text-[var(--admin-text-mute)] hover:bg-[var(--admin-surface)] disabled:opacity-40 focus:outline-none"
                            >
                              {isMember ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Members */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-faint)] mb-2">
                      In this collection ({members.length})
                    </p>
                    {members.length === 0 ? (
                      <p className="text-sm text-[var(--admin-text-mute)]">
                        No products yet. Search above to add some.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {members.map((m) => (
                          <div
                            key={m.productId}
                            className="flex items-center gap-3 px-3 py-2 border border-[var(--admin-border)] rounded-[var(--admin-radius)]"
                          >
                            {m.product.images[0] && (
                              <Image
                                src={m.product.images[0].src}
                                alt=""
                                width={32}
                                height={32}
                                unoptimized
                                className="w-8 h-8 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <span className="flex-1 text-sm">{m.product.name}</span>
                            <button
                              onClick={() => handleRemoveProduct(m.productId)}
                              className="p-1 text-[var(--admin-text-mute)] hover:text-[var(--admin-danger)] focus:outline-none"
                              aria-label="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Collection"
        description={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--admin-text)] text-white text-sm px-4 py-2.5 rounded-[var(--admin-radius)] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
