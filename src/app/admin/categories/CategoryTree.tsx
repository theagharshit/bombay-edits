'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, ExternalLink, FolderTree } from 'lucide-react';
import { ConfirmDialog } from '@/components/admin/feedback/ConfirmDialog';
import { EmptyState } from '@/components/admin/feedback/EmptyState';
import { StatusBadge } from '@/components/admin/feedback/StatusBadge';
import { slugify } from '@/lib/admin/slug';
import {
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
} from '@/app/actions/admin/category';
import type { CategoryWithChildren } from './page';

type FlatCategory = CategoryWithChildren | CategoryWithChildren['children'][number];

type Props = { categories: CategoryWithChildren[] };

export function CategoryTree({ categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(categories.map(c => c.id)));
  const [editing, setEditing] = useState<FlatCategory | 'new' | null>(null);
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlatCategory | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const allCategories = categories.flatMap(c => [c, ...c.children]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (editing === 'new') {
          if (newParentId) fd.set('parentId', newParentId);
          await createCategory(fd);
          setToast('Category created.');
        } else if (editing) {
          await updateCategory(editing.id, fd);
          setToast('Category updated.');
        }
        setEditing(null);
        setNewParentId(null);
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
        await deleteCategory(deleteTarget.id);
        setToast('Category deleted.');
        setDeleteTarget(null);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Delete failed.');
        setDeleteTarget(null);
      }
    });
  };

  const handleToggle = (cat: FlatCategory) => {
    startTransition(async () => {
      await toggleCategoryActive(cat.id, !cat.isActive);
      router.refresh();
    });
  };

  const openNew = (parentId?: string) => {
    setNewParentId(parentId ?? null);
    setEditing('new');
  };

  const editingParentId = editing !== null && editing !== 'new' ? editing.parentId : newParentId;
  const topLevelCategories = categories.filter(c => c.parentId === null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--admin-text-mute)]">{categories.length} top-level, {categories.reduce((s, c) => s + c.children.length, 0)} subcategories</p>
        <button
          onClick={() => openNew()}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] text-sm rounded-[var(--admin-radius)]">
          {error} <button className="ml-2 underline text-xs" onClick={() => setError('')}>Dismiss</button>
        </div>
      )}

      {/* Tree */}
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories yet"
          description="Create your first category. It will appear in the mega menu and as a filtering option."
          action={<button onClick={() => openNew()} className="px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white">Add Category</button>}
        />
      ) : (
        <div className="bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
          {topLevelCategories.map((cat, idx) => (
            <div key={cat.id} className={idx < topLevelCategories.length - 1 ? 'border-b border-[var(--admin-border)]' : ''}>
              {/* Parent row */}
              <div className="flex items-center gap-2 px-3 h-[var(--admin-row-h)] hover:bg-[var(--admin-surface)] group">
                <button
                  onClick={() => setExpanded(prev => { const next = new Set(prev); next.has(cat.id) ? next.delete(cat.id) : next.add(cat.id); return next; })}
                  className="text-[var(--admin-text-mute)] focus:outline-none"
                  aria-label={expanded.has(cat.id) ? 'Collapse' : 'Expand'}
                >
                  {cat.children.length > 0
                    ? expanded.has(cat.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    : <span className="w-4" />}
                </button>
                {cat.image && <img src={cat.image} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />}
                <span className="flex-1 font-medium text-sm text-[var(--admin-text)]">{cat.name}</span>
                <span className="text-xs text-[var(--admin-text-faint)] font-mono">{cat.slug}</span>
                <span className="text-xs text-[var(--admin-text-mute)]">{cat.children.length} sub</span>
                <a href={`/admin/products?categoryId=${cat.id}`} className="flex items-center gap-1 text-xs text-[var(--admin-info)] hover:underline">
                  {cat._count.products} <ExternalLink className="w-3 h-3" />
                </a>
                <StatusBadge status={cat.isActive ? 'ACTIVE' : 'ARCHIVED'} label={cat.isActive ? 'Active' : 'Inactive'} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openNew(cat.id)} title="Add subcategory" className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"><Plus className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleToggle(cat)} title={cat.isActive ? 'Deactivate' : 'Activate'} className="p-1.5 text-[var(--admin-text-mute)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]">
                    {cat.isActive ? <ToggleRight className="w-4 h-4 text-[var(--admin-ok)]" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditing(cat)} title="Edit" className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(cat)} title="Delete" className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-danger)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Children */}
              {expanded.has(cat.id) && cat.children.map(child => (
                <div key={child.id} className="flex items-center gap-2 px-3 pl-10 h-[var(--admin-row-h)] border-t border-[var(--admin-border)] bg-[var(--admin-surface)]/50 hover:bg-[var(--admin-surface)] group">
                  <span className="flex-1 text-sm text-[var(--admin-text)]">{child.name}</span>
                  <span className="text-xs text-[var(--admin-text-faint)] font-mono">{child.slug}</span>
                  <a href={`/admin/products?categoryId=${child.id}`} className="flex items-center gap-1 text-xs text-[var(--admin-info)] hover:underline">
                    {child._count.products} <ExternalLink className="w-3 h-3" />
                  </a>
                  <StatusBadge status={child.isActive ? 'ACTIVE' : 'ARCHIVED'} label={child.isActive ? 'Active' : 'Inactive'} />
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleToggle(child)} className="p-1.5 text-[var(--admin-text-mute)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]">
                      {child.isActive ? <ToggleRight className="w-4 h-4 text-[var(--admin-ok)]" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditing(child)} title="Edit" className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteTarget(child)} title="Delete" className="p-1.5 text-[var(--admin-text-mute)] hover:text-[var(--admin-danger)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Slide-over editor */}
      {editing !== null && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Edit Category">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setEditing(null); setNewParentId(null); }} />
          <div className="relative ml-auto z-10 w-full max-w-md bg-[var(--admin-panel)] h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)]">
              <h2 className="font-semibold text-base">{editing === 'new' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => { setEditing(null); setNewParentId(null); }} className="text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] rounded p-1">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <input type="hidden" name="isActive" value={editing !== 'new' ? String(editing.isActive) : 'true'} />

              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="cat-name">Name *</label>
                <input id="cat-name" name="name" required defaultValue={editing !== 'new' ? editing.name : ''}
                  className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]" />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="cat-slug">Slug</label>
                <input id="cat-slug" name="slug" placeholder="auto-generated" defaultValue={editing !== 'new' ? editing.slug : ''}
                  className="w-full px-3 py-2 text-sm font-mono border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]" />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="cat-parent">Parent (leave empty for top-level)</label>
                <select id="cat-parent" name="parentId"
                  defaultValue={editingParentId ?? ''}
                  className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]">
                  <option value="">None (top-level)</option>
                  {categories.filter(c => c.parentId === null && (editing === 'new' || editing?.id !== c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="cat-desc">Description</label>
                <textarea id="cat-desc" name="description" rows={2} defaultValue={editing !== 'new' ? (editing.description ?? '') : ''}
                  className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]" />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="cat-sort">Sort Order</label>
                <input id="cat-sort" name="sortOrder" type="number" min={0} defaultValue={editing !== 'new' ? editing.sortOrder : 0}
                  className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]" />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="cat-meta-title">Meta Title (≤60)</label>
                <input id="cat-meta-title" name="metaTitle" maxLength={60} defaultValue={editing !== 'new' ? (editing.metaTitle ?? '') : ''}
                  className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]" />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-text-mute)] mb-1" htmlFor="cat-meta-desc">Meta Description (≤160)</label>
                <textarea id="cat-meta-desc" name="metaDescription" maxLength={160} rows={2} defaultValue={editing !== 'new' ? (editing.metaDescription ?? '') : ''}
                  className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]" />
              </div>

              {error && <p className="text-xs text-[var(--admin-danger)]" role="alert">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isPending}
                  className="flex-1 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]">
                  {isPending ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => { setEditing(null); setNewParentId(null); }}
                  className="flex-1 py-2 text-sm font-medium rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]">
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
        title="Delete Category"
        description={deleteTarget ? `Delete "${deleteTarget.name}"? Products in this category will not be deleted, but will lose their category assignment.` : ''}
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
