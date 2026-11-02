'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { Menu } from '../types/menu.type';

const isMatch = (path: string, pathname: string) =>
  path === '/'
    ? pathname === '/'
    : pathname === path || pathname.startsWith(`${path}/`);

export const useMenu = (menus: Menu[]) => {
  const pathname = usePathname() ?? '/';

  const activeMenu = useMemo(
    () =>
      menus
        .filter((m) => isMatch(m.path, pathname))
        .sort((a, b) => b.path.length - a.path.length)
        .at(0),
    [menus, pathname]
  );

  return { menus, activeMenu };
};
