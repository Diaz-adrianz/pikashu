import type { Menu } from '@/types/menu.type';
import Link from 'next/link';
import { type ComponentProps } from 'react';
import { Button } from '../ui/button';

export const MenuItemContent = ({
  menu,
  active,
}: {
  menu: Menu;
  active?: boolean;
}) => {
  const Icon = active ? (menu.IconActive ?? menu.Icon) : menu.Icon;

  return (
    <>
      {Icon && <Icon />} {menu.label}
    </>
  );
};

export const MenuItemLink = ({
  menu,
  active,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> & {
  menu: Menu;
  active?: boolean;
}) => {
  return (
    <Link href={menu.path} target={menu.target} {...props}>
      <MenuItemContent menu={menu} active={active} />
    </Link>
  );
};

export const MenuItemButtonLink = ({
  menu,
  active,
  ...props
}: ComponentProps<typeof Button> & {
  menu: Menu;
  active?: boolean;
}) => {
  return (
    <Button variant={'link'} {...props} asChild>
      <Link href={menu.path} target={menu.target}>
        <MenuItemContent menu={menu} active={active} />
      </Link>
    </Button>
  );
};
