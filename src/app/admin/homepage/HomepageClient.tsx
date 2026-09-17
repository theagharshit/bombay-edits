'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upsertManyStoreSettings } from '@/app/actions/admin/settings';
import { toast } from 'sonner';
import { Home, ExternalLink } from 'lucide-react';

const HERO_FIELDS = [
  { key: 'homepage_hero_title', label: 'Hero Title', type: 'text', placeholder: 'Exquisite Indian Wear' },
  { key: 'homepage_hero_subtitle', label: 'Hero Subtitle', type: 'text', placeholder: 'Handcrafted for the modern woman' },
  { key: 'homepage_hero_cta_label', label: 'Hero CTA Button Text', type: 'text', placeholder: 'Shop Now' },
  { key: 'homepage_hero_cta_link', label: 'Hero CTA Link', type: 'text', placeholder: '/collections/new-arrivals' },
  { key: 'homepage_hero_image', label: 'Hero Image URL', type: 'text', placeholder: 'https://...' },
  { key: 'homepage_announcement', label: 'Announcement Bar Text', type: 'text', placeholder: 'Free shipping over Rs. 5,000 · WhatsApp us' },
];

export function HomepageClient({ settings, collections }: { settings: Record<string, any>; collections: any[] }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(HERO_FIELDS.map((f) => [f.key, settings[f.key] ?? '']))
  );
  const [featuredIds, setFeaturedIds] = useState<string[]>(
    (settings['homepage_featured_collection_ids'] as string[] | null) ?? []
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const toggleCollection = (id: string) => {
    setFeaturedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertManyStoreSettings({ ...form, homepage_featured_collection_ids: featuredIds as any });
      toast.success('Homepage settings saved');
      setDirty(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Homepage</h1>
          <p className="text-sm text-gray-500 mt-1">Configure what appears on the storefront homepage.</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 border rounded text-sm hover:bg-gray-50">
            <ExternalLink className="w-3.5 h-3.5" /> Preview
          </a>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold flex items-center gap-2"><Home className="w-4 h-4" /> Hero Section</h2>
        </div>
        <div className="p-5 space-y-4">
          {HERO_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>
          ))}
          {form['homepage_hero_image'] && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Preview:</div>
              <img src={form['homepage_hero_image']} alt="Hero preview" className="h-32 w-auto object-cover rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
      </div>

      {/* Featured Collections */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold">Featured Collections</h2>
          <p className="text-xs text-gray-500 mt-0.5">Select which collections appear in the homepage grid.</p>
        </div>
        <div className="p-5">
          {collections.length === 0 ? (
            <p className="text-sm text-gray-400">No active collections. <a href="/admin/collections" className="text-[var(--admin-accent)] hover:underline">Create one</a>.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {collections.map((c: any) => (
                <label key={c.id} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={featuredIds.includes(c.id)}
                    onChange={() => toggleCollection(c.id)}
                    className="rounded"
                  />
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-400 font-mono">/{c.slug}</div>
                  </div>
                  {c.isFeatured && <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Featured</span>}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
