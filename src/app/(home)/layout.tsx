import type { Metadata } from 'next';
import { LogoIcon } from '@/assets/images';
import {
  Header,
  HeaderNav,
  HeaderNavSheet,
  HeaderUser,
  NavItem,
} from '@/components/shared/header';
import { MarketingFooter } from '@/components/shared/marketing-footer';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pikashu | Pemesanan Bus dan Minibus',
  description:
    'Cari perjalanan, lihat fasilitas, pilih kursi, dan bawa tiket QR untuk boarding.',
};

const NAVS: NavItem[] = [
  { href: '/', label: 'Cari' },
  { href: '/trips', label: 'Perjalanan' },
  { href: '/bookings', label: 'Pemesanan' },
  { href: '/facilities', label: 'Fasilitas' },
  { href: '/about-us', label: 'Tentang Kami' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header className="bg-background">
        <HeaderNavSheet items={NAVS} className="md:hidden" />
        <Link href={'/'} className="me-auto w-20">
          <Image src={LogoIcon} alt="Pikashu logo" />
        </Link>
        <HeaderNav items={NAVS} className="not-md:hidden" />
        <HeaderUser />
      </Header>
      {children}
      <MarketingFooter />
    </>
  );
}
