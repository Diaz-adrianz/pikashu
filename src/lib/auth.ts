import { PrismaAdapter } from '@auth/prisma-adapter';
import { AuthOptions, getServerSession, Session } from 'next-auth';
import { prisma } from './prisma';
import { Role } from '@/generated/prisma/enums';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { headers } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { decode, encode } from 'next-auth/jwt';
import { Adapter } from 'next-auth/adapters';

/** --------------------------------------
 * Classes
 * -------------------------------------- */
export class UnauthenticatedError extends Error {}

export class ForbiddenError extends Error {}

/** --------------------------------------
 * Config
 * -------------------------------------- */
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: 'database', maxAge: MAX_AGE },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/auth/login' },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        return ok ? user : null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === 'credentials') token.credentials = true;
      return token;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },

  jwt: {
    async encode(params) {
      if (params.token?.credentials) {
        const sessionToken = randomUUID();
        await prisma.session.create({
          data: {
            sessionToken,
            userId: params.token.sub!,
            expires: new Date(Date.now() + MAX_AGE * 1000),
          },
        });
        return sessionToken;
      }
      return encode(params);
    },
    async decode(params) {
      if (!params.token) return null;
      return decode(params);
    },
  },
};

/** --------------------------------------
 * Guards
 * -------------------------------------- */
type Roles = Role[] | '*';
type Strategy = 'redirect' | 'throw';

export async function authorized(
  roles?: Roles,
  strategy?: undefined
): Promise<Session | null>;
export async function authorized(
  roles: Roles,
  strategy: Strategy
): Promise<Session>;
export async function authorized(
  roles: Roles = '*',
  strategy?: Strategy
): Promise<Session | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    if (strategy === 'redirect') {
      const path = (await headers()).get('x-pathname') || '/';
      redirect(`/auth/login?callback=${encodeURIComponent(path)}`, 'replace');
    }
    if (strategy === 'throw') throw new UnauthenticatedError();
    return null;
  }

  const role = session.user.role;
  if (roles !== '*' && (!role || !roles.includes(role))) {
    if (strategy === 'redirect') forbidden();
    if (strategy === 'throw') throw new ForbiddenError();
    return null;
  }

  return session;
}
