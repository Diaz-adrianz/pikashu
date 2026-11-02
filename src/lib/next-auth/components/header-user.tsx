'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/utils/string';
import { RiAccountBoxLine, RiLogoutBoxLine } from '@remixicon/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export const HeaderUser = () => {
  const { data: session } = useSession();

  const onLogout = () => signOut({ callbackUrl: '/' });

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon'}>
          <Avatar>
            <AvatarImage src={session.user.image ?? ''} alt="shadcn" />
            <AvatarFallback>
              {getInitials(session.user.name ?? '-')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={'/profil'}>
              <RiAccountBoxLine />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogout} variant="destructive">
            <RiLogoutBoxLine />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
