'use client';

import { MenuItemLink } from '@/components/shared/menu-item';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useMenu } from '@/hooks/use-menu';
import { Menu } from '@/types/menu.type';
import {
  RiDashboardFill,
  RiDashboardLine,
  RiAppsFill,
  RiAppsLine,
  RiBankCardFill,
  RiBankCardLine,
  RiGroup3Fill,
  RiGroup3Line,
  RiMailSendFill,
  RiMailSendLine,
  RiPaletteFill,
  RiPaletteLine,
  RiPriceTag3Fill,
  RiPriceTag3Line,
  RiUploadCloudFill,
  RiUploadCloudLine,
} from '@remixicon/react';

export const MenusGroup: { group: string; menus: Menu[] }[] = [
  {
    group: 'Order',
    menus: [
      {
        path: '/admin/invitations',
        label: 'Undangan',
        Icon: RiMailSendLine,
        IconActive: RiMailSendFill,
      },
      {
        path: '/admin/payments',
        label: 'Pembayaran',
        Icon: RiBankCardLine,
        IconActive: RiBankCardFill,
      },
    ],
  },
  {
    group: 'Master data',
    menus: [
      {
        path: '/admin/categories',
        label: 'Kategori',
        Icon: RiPriceTag3Line,
        IconActive: RiPriceTag3Fill,
      },
      {
        path: '/admin/features',
        label: 'Fitur',
        Icon: RiAppsLine,
        IconActive: RiAppsFill,
      },
      {
        path: '/admin/themes',
        label: 'Tema',
        Icon: RiPaletteLine,
        IconActive: RiPaletteFill,
      },
      {
        path: '/admin/assets',
        label: 'Aset',
        Icon: RiUploadCloudLine,
        IconActive: RiUploadCloudFill,
      },
    ],
  },
  {
    group: 'IAM',
    menus: [
      {
        path: '/admin/users',
        label: 'User',
        Icon: RiGroup3Line,
        IconActive: RiGroup3Fill,
      },
    ],
  },
];

export const LayoutSidebarMenu = () => {
  const { activeMenu } = useMenu(MenusGroup.flatMap((mg) => mg.menus));

  return (
    <>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive={!activeMenu} asChild>
              <MenuItemLink
                menu={{
                  path: '/admin',
                  label: 'Dasbor',
                  Icon: RiDashboardLine,
                  IconActive: RiDashboardFill,
                }}
                active={!activeMenu}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {MenusGroup.map((mg) => {
        return (
          <SidebarGroup key={mg.group}>
            <SidebarGroupLabel>{mg.group}</SidebarGroupLabel>
            <SidebarMenu>
              {mg.menus.map((menu) => {
                const active = activeMenu?.path === menu.path;
                return (
                  <SidebarMenuItem key={menu.path}>
                    <SidebarMenuButton isActive={active} asChild>
                      <MenuItemLink menu={menu} active={active} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
};
