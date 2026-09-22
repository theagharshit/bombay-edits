import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/backend/db/prisma';
import { verifyPassword } from '@/backend/utils/jwt';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  logger: {
    error(error) {
      if (
        error.name === 'CredentialsSignin' ||
        (error as { type?: string }).type === 'CredentialsSignin'
      ) {
        console.warn('[auth] Sign-in failed: Invalid email or password');
        return;
      }
      console.error('[auth][error]', error);
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        const ADMIN_EMAIL = (
          process.env.ADMIN_SEED_EMAIL || 'admin@thebombayedit.com'
        ).toLowerCase();
        const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'password123';

        // 1. Check seed admin credentials
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { id: 'admin-seed', name: 'Admin', email: ADMIN_EMAIL, role: 'OWNER' };
        }

        // 2. Check AdminUser in database
        try {
          const adminUser = await prisma.adminUser.findUnique({
            where: { email },
          });

          if (adminUser && adminUser.isActive) {
            const isValid = await verifyPassword(password, adminUser.passwordHash);
            if (isValid) {
              await prisma.adminUser.update({
                where: { id: adminUser.id },
                data: { lastLoginAt: new Date() },
              });
              return {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
              };
            }
          }
        } catch {
          // fallback if DB error
        }

        return null;
      },
    }),
  ],
});
