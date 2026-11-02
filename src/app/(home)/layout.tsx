import {
  Header,
  HeaderLogo,
  HeaderNav,
  HeaderNavSheet,
} from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { MainMenus } from '@/data/menu';
import { Authorized } from '@/lib/next-auth/components/authorized';
import { HeaderUser } from '@/lib/next-auth/components/header-user';
import { RiLoginBoxLine } from '@remixicon/react';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header
        slotLeft={
          <>
            <HeaderNavSheet menus={MainMenus} className="md:hidden" />
            <HeaderLogo />
          </>
        }
        slotMiddle={<HeaderNav menus={MainMenus} className="not-md:hidden" />}
        slotRight={
          <Authorized
            fallback={
              <Button asChild>
                <Link href={'/auth/login'}>
                  <RiLoginBoxLine />
                  Masuk
                </Link>
              </Button>
            }
          >
            <Button variant={'link'} asChild>
              <Link href={'/dashboard'}>Dasbor</Link>
            </Button>
            <HeaderUser />
          </Authorized>
        }
      />
      {children}
    </>
  );
}
