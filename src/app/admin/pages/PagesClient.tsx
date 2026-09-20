'use client';
import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { format } from 'date-fns';
import { upsertPage, deletePage } from '@/app/actions/admin/pages';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/app/admin/_components/ConfirmDialog';
import { Pagination } from '@/app/admin/_components/Pagination';
import { Plus, Pencil, ExternalLink } from 'lucide-react';

type PageStatus = 'DRAFT' | 'PUBLISHED';

type Page = {
  id: string;
  slug: string;
  title: string;
  body: string;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: Date;
};

type PaginationMeta = {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
};

type EditingPage = {
  id: string;
  slug: string;
  title: string;
  body: string;
  status: PageStatus;
  metaTitle: string;
  metaDescription: string;
};

const EMPTY: EditingPage = {
  id: '',
  slug: '',
  title: '',
  body: '',
  status: 'DRAFT',
  metaTitle: '',
  metaDescription: '',
};

export function PagesClient({ data, meta }: { data: Page[]; meta: PaginationMeta }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState<EditingPage | null>(null);
  const [saving, setSaving] = useState(false);

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (v) p.set(k, v);
    else p.delete(k);
    p.set('page', '1');
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };
  const handleSearch = useDebouncedCallback((v: string) => setParam('q', v), 300);

  const openEdit = (page: Page) =>
    setEditing({
      id: page.id,
      slug: page.slug,
      title: page.title,
      body: page.body,
      status: (page.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT') as PageStatus,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await upsertPage({
        ...editing,
        metaTitle: editing.metaTitle || undefined,
        metaDescription: editing.metaDescription || undefined,
      });
      toast.success('Page saved');
      setEditing(null);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePage(id);
      toast.success('Deleted');
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error deleting page');
    }
  };

  const currentStatus = searchParams.get('status') || '';

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Content Pages</h1>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New Page
        </button>
      </div>

      {editing && (
        <form
          onSubmit={handleSave}
          className="bg-white border rounded shadow-sm p-6 mb-8 space-y-4"
        >
          <h2 className="text-lg font-semibold">{editing.id ? 'Edit Page' : 'New Page'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                required
                value={editing.title}
                onChange={(e) => setEditing((f) => (f ? { ...f, title: e.target.value } : f))}
                placeholder="About Us"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                required
                value={editing.slug}
                onChange={(e) => setEditing((f) => (f ? { ...f, slug: e.target.value } : f))}
                placeholder="about-us"
                className="w-full px-3 py-2 border rounded text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing((f) => (f ? { ...f, status: e.target.value as PageStatus } : f))
                }
                className="w-full px-3 py-2 border rounded text-sm bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Meta Title</label>
              <input
                value={editing.metaTitle}
                onChange={(e) => setEditing((f) => (f ? { ...f, metaTitle: e.target.value } : f))}
                placeholder="Optional SEO title"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <input
              value={editing.metaDescription}
              onChange={(e) =>
                setEditing((f) => (f ? { ...f, metaDescription: e.target.value } : f))
              }
              placeholder="Optional SEO description"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Body (HTML or Markdown) *</label>
            <textarea
              required
              value={editing.body}
              onChange={(e) => setEditing((f) => (f ? { ...f, body: e.target.value } : f))}
              rows={12}
              placeholder="<p>Page content here...</p>"
              className="w-full px-3 py-2 border rounded text-sm font-mono"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Page'}
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

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex bg-gray-100 rounded p-1">
          {[
            { value: '', label: 'All' },
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'DRAFT', label: 'Draft' },
          ].map((t) => (
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
          placeholder="Search pages..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-64"
        />
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Title</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">
                Slug
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">
                Updated
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  No pages yet.
                </td>
              </tr>
            ) : (
              data.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{page.title}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500 hidden md:table-cell">
                    /{page.slug}
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell">
                    {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {page.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(page)}
                        className="p-1.5 border rounded hover:bg-gray-50"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 border rounded hover:bg-gray-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <ConfirmDialog
                        trigger={
                          <button className="p-1.5 border border-red-200 rounded hover:bg-red-50 text-red-600 text-xs px-2 py-1">
                            Del
                          </button>
                        }
                        title="Delete Page"
                        description={`Delete "${page.title}"?`}
                        confirmLabel="Delete"
                        onConfirm={() => handleDelete(page.id)}
                      />
                    </div>
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
