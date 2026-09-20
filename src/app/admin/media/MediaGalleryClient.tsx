'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { Search, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaDetailSheet } from './MediaDetailSheet';
import { EmptyState } from '@/components/admin/feedback/EmptyState';

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

type PaginationMeta = {
  total: number;
  page: number;
  take: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Props = {
  assets: MediaAsset[];
  meta: PaginationMeta;
  folders: string[];
  mimeTypes: string[];
  currentSort: string;
};

export function MediaGalleryClient({ assets, meta, folders, mimeTypes, currentSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [uploads, setUploads] = useState<
    { id: string; name: string; progress: number; error?: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  useEffect(() => {
    const timer = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        sp.set('q', searchValue);
      } else {
        sp.delete('q');
      }
      sp.delete('page');
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, pathname, router, searchParams]);

  const updateParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
    sp.delete('page');
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  const navigatePage = (newPage: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(newPage));
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  // Image dimension reader
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 }); // Fallback
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newUploads = Array.from(files).map((f, i) => ({
      id: `${Date.now()}-${i}`,
      file: f,
      name: f.name,
      progress: 0,
    }));

    // Add to UI state
    setUploads((prev) => [
      ...newUploads.map((u) => ({ id: u.id, name: u.name, progress: 0 })),
      ...prev,
    ]);

    // Process each
    for (const u of newUploads) {
      if (u.file.size > 8 * 1024 * 1024) {
        setUploads((prev) =>
          prev.map((p) => (p.id === u.id ? { ...p, progress: 100, error: 'Exceeds 8MB limit' } : p))
        );
        continue;
      }

      try {
        const { width, height } = await getImageDimensions(u.file);

        await upload(u.name, u.file, {
          access: 'public',
          handleUploadUrl: '/api/admin/media/upload',
          clientPayload: JSON.stringify({ width, height, filename: u.name, size: u.file.size }),
          onUploadProgress: (event) => {
            setUploads((prev) =>
              prev.map((p) => (p.id === u.id ? { ...p, progress: event.percentage } : p))
            );
          },
        });

        // Remove from pending if successful
        setUploads((prev) => prev.filter((p) => p.id !== u.id));
        router.refresh(); // Refresh list to show new asset
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Upload failed';
        setUploads((prev) => prev.map((p) => (p.id === u.id ? { ...p, error: errorMsg } : p)));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
  };

  return (
    <div
      className="flex flex-col h-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-faint)]" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search filename or alt text..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
          />
        </div>

        <select
          value={searchParams.get('folder') || ''}
          onChange={(e) => updateParam('folder', e.target.value)}
          className="px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] min-w-[120px]"
        >
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get('mimeType') || ''}
          onChange={(e) => updateParam('mimeType', e.target.value)}
          className="px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] min-w-[120px]"
        >
          <option value="">All file types</option>
          {mimeTypes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="px-3 py-2 text-sm border border-[var(--admin-border)] rounded-[var(--admin-radius)] bg-[var(--admin-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] min-w-[120px]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A-Z)</option>
          <option value="size_desc">Size (Largest)</option>
          <option value="size_asc">Size (Smallest)</option>
        </select>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)]"
        >
          <Upload className="w-4 h-4" /> Upload
        </button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Active Uploads */}
      {uploads.length > 0 && (
        <div className="mb-6 space-y-2">
          {uploads.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 bg-[var(--admin-surface)] p-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)]"
            >
              <span className="text-sm font-medium w-48 truncate">{u.name}</span>
              <div className="flex-1 h-2 bg-[var(--admin-border)] rounded-full overflow-hidden">
                <div
                  className={`h-full ${u.error ? 'bg-[var(--admin-danger)]' : 'bg-[var(--admin-accent)]'} transition-all`}
                  style={{ width: `${u.progress}%` }}
                />
              </div>
              <span className="text-xs text-[var(--admin-text-mute)] w-24 text-right">
                {u.error ? u.error : `${Math.round(u.progress)}%`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {assets.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media found"
          description={
            searchParams.toString()
              ? 'Try adjusting your filters or search term.'
              : 'Upload your first image to start building your media library.'
          }
          action={
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-sm font-medium rounded-[var(--admin-radius)] bg-[var(--admin-accent)] text-white"
            >
              Upload Image
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset as MediaAsset)}
                className="group flex flex-col items-center bg-[var(--admin-panel)] border border-[var(--admin-border)] rounded-lg overflow-hidden hover:border-[var(--admin-focus)] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-focus)] transition-all text-left"
              >
                <div className="w-full aspect-square bg-[var(--admin-surface)] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 pattern-dots text-[var(--admin-border)] opacity-30 z-0" />
                  <Image
                    src={asset.url}
                    alt={asset.altText ?? asset.filename}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    className="object-contain relative z-10 p-2"
                  />
                </div>
                <div className="w-full p-2 border-t border-[var(--admin-border)]">
                  <p className="text-xs font-medium text-[var(--admin-text)] truncate">
                    {asset.filename}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-[var(--admin-text-faint)] font-mono">
                      {(asset.sizeBytes / 1024).toFixed(0)} KB
                    </p>
                    <p className="text-[10px] text-[var(--admin-text-faint)] font-mono">
                      {asset.width}×{asset.height}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between border-t border-[var(--admin-border)] pt-4">
            <span className="text-sm text-[var(--admin-text-mute)]">
              Showing {assets.length} of {meta.total} results
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigatePage(meta.page - 1)}
                disabled={!meta.hasPrev}
                className="p-1.5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface)] disabled:opacity-50 focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[var(--admin-text-mute)] min-w-[60px] text-center">
                {meta.page} / {meta.totalPages || 1}
              </span>
              <button
                onClick={() => navigatePage(meta.page + 1)}
                disabled={!meta.hasNext}
                className="p-1.5 rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface)] disabled:opacity-50 focus:outline-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {selectedAsset && (
        <MediaDetailSheet
          asset={selectedAsset}
          open={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
}
