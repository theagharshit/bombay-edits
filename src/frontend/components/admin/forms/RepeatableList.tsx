'use client';

import { useCallback } from 'react';
import { X, GripVertical, Plus } from 'lucide-react';

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxItems?: number;
};

export function RepeatableList({ label, values, onChange, placeholder = 'Add item…', maxItems = 30 }: Props) {
  const add = useCallback(() => {
    if (values.length >= maxItems) return;
    onChange([...values, '']);
  }, [values, onChange, maxItems]);

  const remove = useCallback(
    (index: number) => {
      onChange(values.filter((_, i) => i !== index));
    },
    [values, onChange],
  );

  const update = useCallback(
    (index: number, value: string) => {
      const next = [...values];
      next[index] = value;
      onChange(next);
    },
    [values, onChange],
  );

  return (
    <div>
      <p className="text-xs font-medium text-[var(--admin-text-mute)] mb-2 uppercase tracking-wide">{label}</p>
      <div className="space-y-1.5">
        {values.map((val, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <GripVertical className="w-4 h-4 text-[var(--admin-text-faint)] flex-shrink-0 cursor-grab" />
            <input
              type="text"
              value={val}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-1.5 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[var(--admin-text-faint)] hover:text-[var(--admin-danger)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] rounded p-0.5"
              aria-label={`Remove item ${i + 1}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      {values.length < maxItems && (
        <button
          type="button"
          onClick={add}
          className="mt-2 flex items-center gap-1.5 text-xs text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] rounded px-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add item
        </button>
      )}
    </div>
  );
}
