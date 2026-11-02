'use client';

import { Role } from '@/lib/prisma/generated/enums';
import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

type Props = {
  roles?: Role[];
  fallback?: React.ReactNode;
  children: React.ReactNode | ((user: Session['user']) => React.ReactNode);
};

export function Authorized({ roles, fallback = null, children }: Props) {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  const user = session?.user;
  if (!user || (roles && (!user.role || !roles.includes(user.role))))
    return fallback;

  return <>{typeof children === 'function' ? children(user) : children}</>;
}
