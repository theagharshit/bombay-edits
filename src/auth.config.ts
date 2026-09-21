import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || 'admin';
        (session.user as { role?: string }).role = (token.role as string) || 'admin';
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
