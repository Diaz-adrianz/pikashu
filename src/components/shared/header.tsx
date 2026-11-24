'use client';

import { useScrollPosition } from '@/hooks/use-scroll-position';
import { cn } from 'cn';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { ComponentProps, useState } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { LogOutIcon, MenuIcon, ShieldUserIcon, UserIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import Image from 'next/image';
import { Logo } from '@/assets/images';

function Header({ children, className, ...props }: ComponentProps<'header'>) {
  const scrollPos = useScrollPosition({ offsetTop: 30, offsetBottom: 20 });

  return (
    <header
      data-scroll-pos={scrollPos}
      className={cn(
        'fixed top-0 right-0 left-0 z-50 h-header border-b border-sidebar-border bg-sidebar transition-all duration-300',
        'data-[scroll-pos=start]:bg-transparent',
        'data-[scroll-pos=start]:border-0',
        'data-[scroll-pos=down]:-translate-y-full',
        className
      )}
      {...props}
    >
      <div className="container mx-auto flex h-full items-center gap-8 px-4 md:px-6 lg:px-8">
        {children}
      </div>
    </header>
  );
}

function HeaderUser() {
  const { data: session, status } = useSession();

  if (status === 'loading') return;

  if (status === 'unauthenticated' || !session)
    return (
      <Button asChild>
        <Link href={'/auth/login'}>Masuk</Link>
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon'} className="rounded-full">
          <Avatar>
            <AvatarImage
              src={session.user.image ?? ''}
              alt="User profile image"
            />
            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="grid">
            <span className="truncate text-base font-medium">
              {session.user.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {session.user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {session.user.role === 'STAFF' && (
            <DropdownMenuItem asChild>
              <Link href={'/staff'}>
                <ShieldUserIcon />
                Staf
              </Link>
            </DropdownMenuItem>
          )}
          {session.user.role === 'ADMIN' && (
            <DropdownMenuItem asChild>
              <Link href={'/admin'}>
                <ShieldUserIcon />
                Admin
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={'/profile'}>
              <UserIcon />
              Profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="destructive"
          >
            <LogOutIcon />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type NavItem = { href: string; label: string };

function HeaderNav({
  items,
  className,
  ...props
}: ComponentProps<'nav'> & {
  items: NavItem[];
}) {
  return (
    <nav className={cn('item flex items-center gap-4', className)} {...props}>
      {items.map((item) => (
        <Button key={item.href} variant={'ghost'} asChild>
          <Link href={item.href}>{item.label}</Link>
        </Button>
      ))}
    </nav>
  );
}

function HeaderNavSheet({
  items,
  className,
  ...props
}: ComponentProps<typeof Button> & {
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={'ghost'}
          size={'icon'}
          className={cn(className)}
          {...props}
        >
          <MenuIcon data-icon="inline-start" />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-4" side="left" showCloseButton={false}>
        <SheetTitle className="sr-only">Navigasi</SheetTitle>

        <Image src={Logo} alt="Pikashu logo" className="mb-8 w-40" />

        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <Button
              key={item.href}
              variant={'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { Header, HeaderUser, HeaderNav, HeaderNavSheet };
export type { NavItem };
