import { LogoText } from '@/assets/images';
import { Header, HeaderUser } from '@/components/shared/header';
import { SidebarNav } from '@/components/shared/sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { authorized } from '@/lib/auth';
import Image from 'next/image';
import { ReactNode } from 'react';

const MENUS = [
  { icon: 'dashboard', href: '/admin', label: 'Dasbor' },
  { icon: 'fleet', href: '/admin/fleets', label: 'Armada' },
  { icon: 'route', href: '/admin/routes', label: 'Rute' },
  { icon: 'schedule', href: '/admin/schedules', label: 'Jadwal' },
  { icon: 'trip', href: '/admin/trips', label: 'Perjalanan' },
  { icon: 'service', href: '/admin/services', label: 'Layanan' },
  { icon: 'facility', href: '/admin/facilities', label: 'Fasilitas' },
  { icon: 'user', href: '/admin/users', label: 'Akun' },
  { icon: 'refund', href: '/admin/refunds', label: 'Refund' },
] as const;

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
            <SidebarNav menus={MENUS} />
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
