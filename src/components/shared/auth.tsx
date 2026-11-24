'use client';

import { SessionProvider as NextSessionProvider } from 'next-auth/react';
import { Role } from '@/generated/prisma/enums';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import { Slot } from '@radix-ui/react-slot';
import { signOut } from 'next-auth/react';

export function Authorized({
  roles,
  fallback = null,
  children,
}: {
  roles?: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode | ((user: Session['user']) => React.ReactNode);
}) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  const user = session?.user;
  if (!user || (roles && (!user.role || !roles.includes(user.role))))
    return fallback;

  return <>{typeof children === 'function' ? children(user) : children}</>;
}

export function SessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <NextSessionProvider session={session}>{children}</NextSessionProvider>
  );
}

export function SignOut({ children }: { children: React.ReactNode }) {
  return <Slot onClick={() => signOut({ callbackUrl: '/' })}>{children}</Slot>;
}
