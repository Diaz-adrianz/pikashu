'use client';

import { Logo } from '@/assets/images';
import { Menu } from '@/types/menu.type';
import { cn } from 'cn';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import {
  ComponentProps,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MenuItemButtonLink } from './menu-item';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { RiMenu2Line } from '@remixicon/react';
import { Container } from './container';

export const Header = ({
  slotLeft,
  slotMiddle,
  slotRight,
  className,
  ...props
}: {
  slotLeft?: ReactNode;
  slotMiddle?: ReactNode;
  slotRight?: ReactNode;
} & React.ComponentProps<'header'>) => {
  const [scrollPos, setScrollPos] = useState<'start' | 'up' | 'down' | 'end'>(
    'start'
  );
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (currentScrollY < 50) setScrollPos('start');
      else if (currentScrollY >= maxScroll - 50) setScrollPos('end');
      else if (currentScrollY < lastScrollY.current) setScrollPos('up');
      else if (currentScrollY > lastScrollY.current) setScrollPos('down');

      lastScrollY.current = currentScrollY;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 left-0 z-40 flex h-16 w-full bg-background shadow-md transition-transform duration-300',
        className,
        scrollPos === 'start' && 'translate-y-0 shadow-none',
        scrollPos === 'up' && 'translate-y-0',
        scrollPos === 'down' && '-translate-y-full',
        scrollPos === 'end' && 'translate-y-0'
      )}
      {...props}
    >
      <Container>
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">{slotLeft}</div>
          <div className="flex items-center gap-2">{slotMiddle}</div>
          <div className="flex items-center gap-2">{slotRight}</div>
        </div>
      </Container>
    </header>
  );
};

// Header logo
// -----------------------------------------------------------------------
export const HeaderLogo = ({
  image = Logo,
  href = '/',
  className,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & {
  href?: string;
  image?: string;
}) => {
  return (
    <Link href={href} className={cn('w-16', className)} {...props}>
      <Image src={image} alt="" />
    </Link>
  );
};

// Header navigation menu
// -----------------------------------------------------------------------
export const HeaderNav = ({
  menus,
  className,
  ...props
}: ComponentProps<'nav'> & {
  menus: Menu[];
}) => {
  return (
    <nav className={cn('flex items-center gap-4', className)} {...props}>
      {menus.map((menu) => (
        <MenuItemButtonLink key={menu.path} menu={menu} />
      ))}
    </nav>
  );
};

export const HeaderNavSheet = ({
  menus,
  className,
  ...props
}: ComponentProps<typeof Button> & {
  menus: Menu[];
}) => {
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
          <RiMenu2Line />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-4" side="left">
        <SheetTitle visually-hidden="true"></SheetTitle>

        <div className="flex flex-col items-start gap-5">
          {menus.map((menu) => (
            <MenuItemButtonLink
              key={menu.path}
              menu={menu}
              onClick={() => setOpen(false)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
