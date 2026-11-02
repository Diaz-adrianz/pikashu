import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { authGuard } from '@/lib/next-auth/guards';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { LayoutSidebarMenu } from './_components/layout-sidebar-menu';
import { Header } from '@/components/shared/header';
import { HeaderUser } from '@/lib/next-auth/components/header-user';
import { LogoText } from '@/assets/images';

export default async function Layout({ children }: { children: ReactNode }) {
  await authGuard(['ADMIN'], 'redirect');

  return (
    <SidebarProvider>
      <Sidebar variant="sidebar">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href={'/'}>
                  <Image src={LogoText} alt="" className="w-40" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <LayoutSidebarMenu />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-secondary/10">
        <Header
          className="border-b border-sidebar-border bg-sidebar"
          slotLeft={<SidebarTrigger />}
          slotRight={<HeaderUser />}
        />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
