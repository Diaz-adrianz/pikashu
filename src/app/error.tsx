'use client';

import { IlusServerFailure } from '@/assets/images';
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

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const image = IlusServerFailure,
    title = 'Ups, Ada Gangguan',
    message =
      process.env.NODE_ENV == 'production'
        ? 'Kami sedang membereskan masalah ini. Coba lagi beberapa saat, ya.'
        : error.message;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Image src={image} alt="Server failure" className="w-52" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center gap-2">
          <Button onClick={() => retry()}>Coba lagi</Button>
          <Button variant={'secondary'} asChild>
            <Link href={'/'} replace>
              Halaman utama
            </Link>
          </Button>
        </EmptyContent>
      </Empty>

      <pre className="mb-40 max-w-lg overflow-x-auto">
        {process.env.NODE_ENV === 'development' ? String(error?.stack) : null}
      </pre>
    </div>
  );
}
