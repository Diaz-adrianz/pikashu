'use client';

import { IlusDarkAlley } from '@/assets/images';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import Image from 'next/image';
import Link from 'next/link';

export default function Forbidden() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Image src={IlusDarkAlley} alt="Server failure" className="w-52" />
          </EmptyMedia>
          <EmptyTitle>Akses Terbatas</EmptyTitle>
          <EmptyDescription>
            Halaman ini hanya untuk akun tertentu.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild>
            <Link href={'/'} replace>
              Halaman utama
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
