import { LogoText } from '@/assets/images';
import { Header, HeaderUser } from '@/components/shared/header';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { authorized } from '@/lib/auth';
import {
  ArmchairIcon,
  BusIcon,
  CalendarClock,
  HeartPlusIcon,
  LayoutDashboardIcon,
  RouteIcon,
  TicketsIcon,
  UsersIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

const MENUS = [
  { icon: LayoutDashboardIcon, href: '/admin', label: 'Dasbor' },
  { icon: BusIcon, href: '/admin/fleets', label: 'Armada' },
  { icon: RouteIcon, href: '/admin/routes', label: 'Rute' },
  { icon: CalendarClock, href: '/admin/schedules', label: 'Jadwal' },
  { icon: TicketsIcon, href: '/admin/trips', label: 'Perjalanan' },
  { icon: HeartPlusIcon, href: '/admin/services', label: 'Layanan' },
  { icon: ArmchairIcon, href: '/admin/facilities', label: 'Fasilitas' },
  { icon: UsersIcon, href: '/admin/users', label: 'Akun' },
];

export default async function Layout({ children }: { children: ReactNode }) {
  await authorized(['ADMIN'], 'redirect');

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="p-2">
              <Image src={LogoText} alt="Pikashu logo" className="mb-2 w-40" />
              <p className="typo-overline text-muted-foreground">Admin panel</p>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {MENUS.map((menu) => (
                <SidebarMenuItem key={menu.href}>
                  <SidebarMenuButton asChild>
                    <Link href={menu.href}>
                      <menu.icon />
                      {menu.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-muted">
        <Header className="absolute">
          <SidebarTrigger />
          <div className="ms-auto">
            <HeaderUser />
          </div>
        </Header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
