'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertNavItem, deleteNavItem, toggleNavItem } from '@/app/actions/admin/navigation';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/app/admin/_components/ConfirmDialog';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';

type NavItem = { id: string; label: string; href: string; group: string | null; sortOrder: number; isActive: boolean; parentId: string | null };
const EMPTY = { id: '', label: '', href: '', group: '', sortOrder: 0, isActive: true, parentId: '' };

export function NavigationClient({ items }: { items: NavItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<typeof EMPTY | null>(null);
  const [saving, setSaving] = useState(false);

  const topLevel = items.filter(i => !i.parentId);
  const children = (parentId: string) => items.filter(i => i.parentId === parentId);

  const openEdit = (item: NavItem) =>
    setEditing({ id: item.id, label: item.label, href: item.href, group: item.group || '', sortOrder: item.sortOrder, isActive: item.isActive, parentId: item.parentId || '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await upsertNavItem({ ...editing, parentId: editing.parentId || undefined, group: editing.group || undefined });
      toast.success('Saved');
      setEditing(null);
      router.refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteNavItem(id); toast.success('Deleted'); router.refresh(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try { await toggleNavItem(id, isActive); router.refresh(); }
    catch (e: any) { toast.error(e.message); }
  };

  const NavRow = ({ item, indent = 0 }: { item: NavItem; indent?: number }) => (
    <>
      <tr className="hover:bg-gray-50">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: indent * 20 }}>
            <GripVertical className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-medium">{item.label}</span>
            {item.group && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.group}</span>}
          </div>
        </td>
        <td className="py-3 px-4 text-gray-500 text-xs font-mono hidden md:table-cell">{item.href}</td>
        <td className="py-3 px-4 text-center">{item.sortOrder}</td>
        <td className="py-3 px-4 text-center">
          <button onClick={() => handleToggle(item.id, !item.isActive)}>
            {item.isActive ? <Eye className="w-4 h-4 text-green-500 mx-auto" /> : <EyeOff className="w-4 h-4 text-gray-300 mx-auto" />}
          </button>
        </td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => openEdit(item)} className="p-1.5 border rounded hover:bg-gray-50"><Pencil className="w-3.5 h-3.5" /></button>
            <ConfirmDialog
              trigger={<button className="p-1.5 border border-red-200 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>}
              title="Delete Navigation Item"
              description={`Delete "${item.label}"?`}
              confirmLabel="Delete"
              onConfirm={() => handleDelete(item.id)}
            />
          </div>
        </td>
      </tr>
      {children(item.id).map(child => <NavRow key={child.id} item={child} indent={indent + 1} />)}
    </>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Navigation</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the storefront navigation menu items.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {editing && (
        <form onSubmit={handleSave} className="bg-white border rounded shadow-sm p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold">{editing.id ? 'Edit Item' : 'New Item'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label *</label>
              <input required value={editing.label} onChange={e => setEditing(f => f ? {...f, label: e.target.value} : f)} placeholder="Sarees" className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL *</label>
              <input required value={editing.href} onChange={e => setEditing(f => f ? {...f, href: e.target.value} : f)} placeholder="/collections/sarees" className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Group (optional)</label>
              <input value={editing.group} onChange={e => setEditing(f => f ? {...f, group: e.target.value} : f)} placeholder="e.g. Main, Footer" className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={editing.sortOrder} onChange={e => setEditing(f => f ? {...f, sortOrder: parseInt(e.target.value)} : f)} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parent (optional)</label>
              <select value={editing.parentId} onChange={e => setEditing(f => f ? {...f, parentId: e.target.value} : f)} className="w-full px-3 py-2 border rounded text-sm bg-white">
                <option value="">No parent (top-level)</option>
                {topLevel.filter(i => i.id !== editing.id).map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="isActive" checked={editing.isActive} onChange={e => setEditing(f => f ? {...f, isActive: e.target.checked} : f)} className="rounded" />
              <label htmlFor="isActive" className="text-sm font-medium">Active (visible in storefront)</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Label</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">URL</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Order</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Visible</th>
              <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topLevel.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-gray-400">No navigation items yet.</td></tr>
            ) : (
              topLevel.map(item => <NavRow key={item.id} item={item} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
