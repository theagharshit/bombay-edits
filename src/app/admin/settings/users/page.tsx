import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { AdminUsersClient } from './AdminUsersClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Users | Admin' };

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
  return <AdminUsersClient users={users} />;
}
