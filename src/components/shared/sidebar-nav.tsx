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
  type LucideIcon,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

type MenuItem = {
  icon: LucideIcon;
  href: string;
  label: string;
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href.split('/').filter(Boolean).length < 2) return false;
  return pathname.startsWith(`${href}/`);
}

function Nav({ menus }: { menus: MenuItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {menus.map(({ icon: Icon, href, label }) => {
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

export function AdminSidebarNav() {
  return (
    <Nav
      menus={[
        { icon: LayoutDashboardIcon, href: '/admin', label: 'Dasbor' },
        { icon: BusIcon, href: '/admin/fleets', label: 'Armada' },
        { icon: RouteIcon, href: '/admin/routes', label: 'Rute' },
        { icon: CalendarClock, href: '/admin/schedules', label: 'Jadwal' },
        { icon: TicketsIcon, href: '/admin/trips', label: 'Perjalanan' },
        { icon: HeartPlusIcon, href: '/admin/services', label: 'Layanan' },
        { icon: ArmchairIcon, href: '/admin/facilities', label: 'Fasilitas' },
        { icon: UsersIcon, href: '/admin/users', label: 'Akun' },
        { icon: Undo2Icon, href: '/admin/refunds', label: 'Refund' },
      ]}
    />
  );
}

export function StaffSidebarNav() {
  return (
    <Nav
      menus={[
        { icon: LayoutDashboardIcon, href: '/staff', label: 'Dasbor' },
        { icon: TicketsIcon, href: '/staff/manifest', label: 'Pemesanan' },
        { icon: QrCodeIcon, href: '/staff/scan', label: 'Pindai QR' },
      ]}
    />
  );
}
