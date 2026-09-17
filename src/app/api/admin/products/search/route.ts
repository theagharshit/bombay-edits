import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50);

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: { select: { src: true }, where: { type: 'front' }, take: 1 },
      },
      take: limit,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
