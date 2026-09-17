import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export type AdminSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
};

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Call at the top of every admin server component, action, and route handler.
 * Returns the session or redirects to /admin/login.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user) {
    redirect('/admin/login');
  }
  const role = (session.user as { role?: string }).role;
  if (!role || !['admin', 'OWNER', 'ADMIN', 'STAFF'].includes(role)) {
    redirect('/admin/login');
  }
  return session as unknown as AdminSession;
}

/**
 * Require a specific role. OWNER > ADMIN > STAFF.
 * Throws ForbiddenError if the session does not have enough privilege.
 */
export async function requireRole(minRole: 'OWNER' | 'ADMIN' | 'STAFF'): Promise<AdminSession> {
  const session = await requireAdmin();
  const hierarchy: Record<string, number> = { STAFF: 1, ADMIN: 2, OWNER: 3, admin: 3 };
  const sessionLevel = hierarchy[session.user.role] ?? 0;
  const requiredLevel = hierarchy[minRole] ?? 0;
  if (sessionLevel < requiredLevel) {
    throw new ForbiddenError(`Requires ${minRole} role`);
  }
  return session;
}
