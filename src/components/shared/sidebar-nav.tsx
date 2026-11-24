'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArmchairIcon,
  BusIcon,
  CalendarClock,
  HeartPlusIcon,
  LayoutDashboardIcon,
  QrCodeIcon,
  RouteIcon,
  TicketsIcon,
  Undo2Icon,
  UsersIcon,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const ICONS = {
  dashboard: LayoutDashboardIcon,
  fleet: BusIcon,
  route: RouteIcon,
  schedule: CalendarClock,
  trip: TicketsIcon,
  service: HeartPlusIcon,
  facility: ArmchairIcon,
  user: UsersIcon,
  refund: Undo2Icon,
  qr: QrCodeIcon,
};

type MenuItem = {
  icon: keyof typeof ICONS;
  href: string;
  label: string;
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href.split('/').filter(Boolean).length < 2) return false;
  return pathname.startsWith(`${href}/`);
}

export function SidebarNav({ menus }: { menus: readonly MenuItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menus.map(({ icon, href, label }) => {
        const Icon = ICONS[icon];
        const active = isActive(pathname, href);
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton asChild isActive={active}>
              <Link href={href} aria-current={active ? 'page' : undefined}>
                <Icon />
                {label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
