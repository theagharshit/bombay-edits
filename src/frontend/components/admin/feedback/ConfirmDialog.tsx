'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmWord?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  loading?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmWord,
  onConfirm,
  onCancel,
  destructive = false,
  loading = false,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => (confirmWord ? inputRef.current?.focus() : cancelRef.current?.focus()), 50);
    }
  }, [open, confirmWord]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const handleConfirm = () => {
    if (confirmWord && inputRef.current?.value !== confirmWord) return;
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 id="confirm-title" className="font-semibold text-base text-[var(--admin-text)]">
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] ml-4 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-[var(--admin-text-mute)] mb-4">{description}</p>

        {confirmWord && (
          <div className="mb-4">
            <label className="block text-xs text-[var(--admin-text-mute)] mb-1.5">
              Type <strong className="text-[var(--admin-text)]">{confirmWord}</strong> to confirm
            </label>
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] bg-[var(--admin-bg)]"
              placeholder={confirmWord}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-[var(--admin-border)] rounded-[var(--admin-radius)] text-[var(--admin-text)] hover:bg-[var(--admin-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-[var(--admin-radius)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] disabled:opacity-50 ${
              destructive
                ? 'border border-[var(--admin-danger)] text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/5'
                : 'bg-[var(--admin-accent)] text-[var(--admin-accent-fg)] hover:opacity-90'
            }`}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
