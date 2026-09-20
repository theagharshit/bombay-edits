'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, X, Copy } from 'lucide-react';
import { updateMediaAsset, deleteMediaAsset } from '@/app/actions/admin/media';
import { ConfirmDialog } from '@/components/admin/feedback/ConfirmDialog';

type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  folder: string | null;
  createdAt: Date;
  uploadedById: string;
};

type Props = {
  asset: MediaAsset;
  open: boolean;
  onClose: () => void;
};

export function MediaDetailSheet({ asset, open, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const altText = fd.get('altText') as string;
    const folder = fd.get('folder') as string;

    startTransition(async () => {
      try {
        await updateMediaAsset(asset.id, { altText: altText || null, folder: folder || null });
        setEditing(false);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Update failed');
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteMediaAsset(asset.id);
        setDeleteConfirm(false);
        onClose();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Delete failed');
        setDeleteConfirm(false);
      }
    });
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(asset.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[var(--admin-panel)] shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Media Details"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--admin-border)] shrink-0">
          <h2 className="font-semibold text-base truncate pr-4">{asset.filename}</h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--admin-text-mute)] hover:text-[var(--admin-text)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-[var(--admin-surface)] rounded-lg overflow-hidden border border-[var(--admin-border)] flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 pattern-dots text-[var(--admin-border)] opacity-30 z-0" />
            <Image
              src={asset.url}
              alt={asset.altText ?? asset.filename}
              width={asset.width ?? 600}
              height={asset.height ?? 400}
              unoptimized
              className="max-h-64 object-contain relative z-10 w-full"
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[var(--admin-danger)]/10 text-[var(--admin-danger)] text-sm rounded-[var(--admin-radius)]">
              {error}
              <button className="ml-2 underline text-xs" onClick={() => setError('')}>
                Dismiss
              </button>
            </div>
          )}

          <form
            onSubmit={handleUpdate}
            className="space-y-4 border-b border-[var(--admin-border)] pb-6 mb-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-[var(--admin-text-mute)] uppercase tracking-wider">
                Details
              </h3>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-sm text-[var(--admin-accent)] font-medium hover:underline focus:outline-none"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-[var(--admin-text-faint)]">Size</span>
              <span className="col-span-2 font-mono text-[var(--admin-text-mute)]">
                {(asset.sizeBytes / 1024).toFixed(1)} KB
              </span>

              <span className="text-[var(--admin-text-faint)]">Dimensions</span>
              <span className="col-span-2 font-mono text-[var(--admin-text-mute)]">
                {asset.width} × {asset.height} px
              </span>

              <span className="text-[var(--admin-text-faint)]">Type</span>
              <span className="col-span-2 font-mono text-[var(--admin-text-mute)]">
                {asset.mimeType}
              </span>

              <span className="text-[var(--admin-text-faint)]">Uploaded</span>
              <span
                className="col-span-2 text-[var(--admin-text-mute)]"
                title={new Date(asset.createdAt).toISOString()}
              >
                {new Date(asset.createdAt).toLocaleDateString()}
              </span>
            </div>

            {editing ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label
                    htmlFor="altText"
                    className="block text-xs text-[var(--admin-text-mute)] mb-1"
                  >
                    Alt Text
                  </label>
                  <input
                    id="altText"
                    name="altText"
                    defaultValue={asset.altText ?? ''}
                    className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="folder"
                    className="block text-xs text-[var(--admin-text-mute)] mb-1"
                  >
                    Folder
                  </label>
                  <input
                    id="folder"
                    name="folder"
                    defaultValue={asset.folder ?? ''}
                    placeholder="e.g. products, banners"
                    className="w-full px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-3 py-1.5 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 text-sm font-medium rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface)]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-sm mt-4">
                <span className="text-[var(--admin-text-faint)]">Alt Text</span>
                <span className="col-span-2 text-[var(--admin-text)] break-words">
                  {asset.altText || '—'}
                </span>

                <span className="text-[var(--admin-text-faint)]">Folder</span>
                <span className="col-span-2 text-[var(--admin-text)]">{asset.folder || '—'}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={copyUrl}
                className="flex items-center gap-1.5 text-sm text-[var(--admin-info)] hover:underline focus:outline-none"
              >
                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy public URL'}
              </button>
            </div>
          </form>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-[var(--admin-text-mute)] uppercase tracking-wider">
                Danger Zone
              </h3>
            </div>
            <button
              onClick={() => setDeleteConfirm(true)}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-[var(--admin-radius)] border border-[var(--admin-danger)] text-[var(--admin-danger)] hover:bg-[var(--admin-danger)] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Delete Asset
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Media Asset"
        description="Are you sure you want to delete this asset? If it is currently used by a product or category, the deletion will be blocked."
        confirmLabel="Delete"
        destructive
        loading={isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </>
  );
}
