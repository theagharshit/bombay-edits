'use client';
import React, { useState } from 'react';
import { upsertManyStoreSettings } from '@/app/actions/admin/settings';
import { toast } from 'sonner';

const FIELDS = [
  { key: 'store_name', label: 'Store Name', type: 'text', placeholder: 'The Bombay Edit' },
  {
    key: 'store_email',
    label: 'Contact Email',
    type: 'email',
    placeholder: 'hello@thebombayedit.com',
  },
  { key: 'store_phone', label: 'Phone Number', type: 'text', placeholder: '+977 ...' },
  {
    key: 'store_address',
    label: 'Store Address',
    type: 'textarea',
    placeholder: 'Full address...',
  },
  { key: 'store_city', label: 'City', type: 'text', placeholder: 'Kathmandu' },
  { key: 'store_country', label: 'Country', type: 'text', placeholder: 'Nepal' },
  {
    key: 'store_instagram',
    label: 'Instagram Handle',
    type: 'text',
    placeholder: '@thebombayedit',
  },
  { key: 'store_whatsapp', label: 'WhatsApp Number', type: 'text', placeholder: '+977 ...' },
  {
    key: 'seo_default_title',
    label: 'Default SEO Title',
    type: 'text',
    placeholder: 'The Bombay Edit | Luxury Indian Wear',
  },
  {
    key: 'seo_default_description',
    label: 'Default Meta Description',
    type: 'textarea',
    placeholder: 'Discover...',
  },
];

export function StoreSettingsClient({ settings }: { settings: Record<string, unknown> }) {
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(
      FIELDS.map((f) => [f.key, settings[f.key] != null ? String(settings[f.key]) : ''])
    )
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertManyStoreSettings(form);
      toast.success('Settings saved');
      setDirty(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Store Details</h1>
          <p className="text-sm text-gray-500 mt-1">Global store configuration and SEO defaults.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white border rounded shadow-sm divide-y">
        {FIELDS.map((field) => (
          <div key={field.key} className="p-5 flex flex-col md:flex-row md:items-start gap-4">
            <label className="text-sm font-medium text-gray-700 md:w-48 flex-shrink-0 pt-1">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
            ) : (
              <input
                type={field.type}
                value={form[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
