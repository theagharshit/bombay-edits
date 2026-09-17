import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { prisma } from '@/backend/db/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const members = await prisma.productCollection.findMany({
      where: { collectionId: id },
      select: {
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: { select: { src: true }, where: { type: 'front' }, take: 1 },
          },
        },
      },
      take: 100,
    });

    return NextResponse.json({ products: members });
  } catch {
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
