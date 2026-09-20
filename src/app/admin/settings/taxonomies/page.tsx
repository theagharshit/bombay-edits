import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';
import { redirect } from 'next/navigation';
import { TaxonomyTable } from './TaxonomyTable';

export const metadata = { title: 'Taxonomies | Admin' };

const TYPES = ['occasions', 'fabrics', 'embroidery-types', 'colours', 'sizes'] as const;
type TaxonomyType = (typeof TYPES)[number];

function isValidType(t: string | undefined): t is TaxonomyType {
  return TYPES.includes(t as TaxonomyType);
}

async function fetchRows(type: TaxonomyType) {
  switch (type) {
    case 'occasions':
      return prisma.occasion
        .findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            _count: { select: { productOccasions: true } },
          },
          orderBy: { name: 'asc' },
          take: 100,
        })
        .then((rows) =>
          rows.map((r) => ({
            ...r,
            productCount: r._count.productOccasions,
            hex: null,
            sizeCode: null,
            sortOrder: 0,
            isActive: true,
          }))
        );

    case 'fabrics':
      return prisma.fabric
        .findMany({
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            _count: { select: { products: true } },
          },
          orderBy: { name: 'asc' },
          take: 100,
        })
        .then((rows) =>
          rows.map((r) => ({
            ...r,
            slug: '',
            productCount: r._count.products,
            hex: null,
            sizeCode: null,
            sortOrder: 0,
            isActive: true,
          }))
        );

    case 'embroidery-types':
      return prisma.embroideryType
        .findMany({
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            _count: { select: { products: true } },
          },
          orderBy: { name: 'asc' },
          take: 100,
        })
        .then((rows) =>
          rows.map((r) => ({
            ...r,
            slug: '',
            productCount: r._count.products,
            hex: null,
            sizeCode: null,
            sortOrder: 0,
            isActive: true,
          }))
        );

    case 'colours':
      return prisma.colour
        .findMany({
          select: {
            id: true,
            name: true,
            hex: true,
            createdAt: true,
            _count: { select: { products: true } },
          },
          orderBy: { name: 'asc' },
          take: 100,
        })
        .then((rows) =>
          rows.map((r) => ({
            ...r,
            slug: '',
            description: null,
            productCount: r._count.products,
            sizeCode: null,
            sortOrder: 0,
            isActive: true,
          }))
        );

    case 'sizes': {
      const sizes = await prisma.productSize.findMany({
        select: { id: true, sizeCode: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
        take: 100,
      });
      // Count via aggregate — ProductSize has no _count relation on stocks in older generated client
      const stockCounts = await prisma.productSizeStock.groupBy({
        by: ['sizeId'],
        _count: { sizeId: true },
      });
      const countMap = Object.fromEntries(stockCounts.map((s) => [s.sizeId, s._count.sizeId]));
      return sizes.map((r) => ({
        ...r,
        name: r.sizeCode,
        slug: '',
        description: null,
        productCount: countMap[r.id] ?? 0,
        hex: null,
        isActive: true,
        createdAt: new Date(),
      }));
    }
  }
}

export type TaxonomyRow = Awaited<ReturnType<typeof fetchRows>>[number];

export default async function TaxonomiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const type = isValidType(sp.type) ? sp.type : 'fabrics';
  if (!isValidType(sp.type)) redirect(`/admin/settings/taxonomies?type=fabrics`);

  const rows = await fetchRows(type);

  return (
    <div className="flex h-full min-h-screen">
      {/* Left type rail */}
      <aside className="w-52 flex-shrink-0 border-r border-[var(--admin-border)] bg-[var(--admin-panel)] pt-6 pr-2">
        <p className="px-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--admin-text-faint)] mb-2">
          Taxonomy Types
        </p>
        {TYPES.map((t) => (
          <a
            key={t}
            href={`/admin/settings/taxonomies?type=${t}`}
            className={`flex items-center px-4 py-2 text-sm rounded-r-[var(--admin-radius)] mb-0.5 font-medium transition-colors ${
              t === type
                ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] border-r-2 border-[var(--admin-accent)]'
                : 'text-[var(--admin-text-mute)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)]'
            }`}
          >
            {t === 'embroidery-types' ? 'Embroidery Types' : t.charAt(0).toUpperCase() + t.slice(1)}
          </a>
        ))}
      </aside>

      {/* Right content */}
      <div className="flex-1 p-6 min-w-0">
        <TaxonomyTable type={type} rows={rows} />
      </div>
    </div>
  );
}
