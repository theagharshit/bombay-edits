import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';
import { Prisma } from '@prisma/client';
import { parsePagination, buildPaginationMeta } from '@/lib/admin/pagination';
import { MediaGalleryClient } from './MediaGalleryClient';

export const metadata = { title: 'Media | Admin' };

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const { skip, take, page } = parsePagination(sp, 50, 100);
  const q = sp.q?.trim() || undefined;
  const folder = sp.folder || undefined;
  const mimeType = sp.mimeType || undefined;
  const sort = sp.sort || 'newest';

  // Build where clause
  const where: Prisma.MediaAssetWhereInput = {};
  if (q) {
    where.OR = [
      { filename: { contains: q, mode: 'insensitive' } },
      { altText: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (folder) where.folder = folder;
  if (mimeType) where.mimeType = mimeType;

  // Build orderBy
  let orderBy: Prisma.MediaAssetOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'name') orderBy = { filename: 'asc' };
  if (sort === 'size_desc') orderBy = { sizeBytes: 'desc' };
  if (sort === 'size_asc') orderBy = { sizeBytes: 'asc' };
  if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  // Run queries
  const [total, assets, rawFolders, rawMimes] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
    prisma.mediaAsset.groupBy({ by: ['folder'], _count: { folder: true } }),
    prisma.mediaAsset.groupBy({ by: ['mimeType'], _count: { mimeType: true } }),
  ]);

  const meta = buildPaginationMeta(total, page, take);

  // Extract facets
  const folders = rawFolders
    .map((f) => f.folder)
    .filter((f): f is string => f !== null)
    .sort();
  const mimeTypes = rawMimes
    .map((m) => m.mimeType)
    .filter(Boolean)
    .sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--admin-text)]">Media Library</h1>
        <p className="text-sm text-[var(--admin-text-mute)] mt-1">
          Manage product images, category banners, and other visual assets.
        </p>
      </div>

      <MediaGalleryClient
        assets={assets}
        meta={meta}
        folders={folders}
        mimeTypes={mimeTypes}
        currentSort={sort}
      />
    </div>
  );
}
