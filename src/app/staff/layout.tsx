import { LogoText } from '@/assets/images';
import { Header, HeaderUser } from '@/components/shared/header';
import { StaffSidebarNav } from '@/components/shared/sidebar-nav';
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
            <StaffSidebarNav />
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
