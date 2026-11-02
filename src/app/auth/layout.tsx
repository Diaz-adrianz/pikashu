import { Logo } from '@/assets/images';
import { Card, CardContent } from '@/components/ui/card';
import { noAuthGuard } from '@/lib/next-auth/guards';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  await noAuthGuard({ redirect: true });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Link href="/" className="mb-8 w-40">
        <Image src={Logo} alt="Logo Pikashu" />
      </Link>
      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
