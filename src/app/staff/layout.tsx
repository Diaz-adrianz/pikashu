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
import { LayoutDashboardIcon, QrCodeIcon, TicketsIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

const MENUS = [
  { icon: LayoutDashboardIcon, href: '/staff', label: 'Dasbor' },
  { icon: TicketsIcon, href: '/staff/manifest', label: 'Pemesanan' },
  { icon: QrCodeIcon, href: '/staff/scan', label: 'Pindai QR' },
];

export default async function Layout({ children }: { children: ReactNode }) {
  await authorized(['STAFF'], 'redirect');

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="p-2">
              <Image src={LogoText} alt="Pikashu logo" className="mb-2 w-40" />
              <p className="typo-overline text-muted-foreground">Staff panel</p>
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
