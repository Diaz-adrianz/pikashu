import { getServerSession, Session } from 'next-auth';
import { headers } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { Role } from '../prisma/generated/enums';
import { authConfig } from './config';
import { ForbiddenError, UnauthenticatedError } from '@/lib/next-auth/errors';

export async function noAuthGuard(opts: { redirect?: boolean } = {}) {
  const session = await getServerSession(authConfig);
  if (session?.user) {
    if (opts.redirect) redirect('/', 'replace');
    else throw new Error('Already authenticated');
  }
}

type Roles = Role[] | '*';
type Strategy = 'redirect' | 'throw';

export async function authGuard(
  roles?: Roles,
  strategy?: undefined
): Promise<Session | null>;
export async function authGuard(
  roles: Roles,
  strategy: Strategy
): Promise<Session>;
export async function authGuard(
  roles: Roles = '*',
  strategy?: Strategy
): Promise<Session | null> {
  const session = await getServerSession(authConfig);

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
