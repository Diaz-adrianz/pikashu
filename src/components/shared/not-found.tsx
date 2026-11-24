import { IlusEmpty } from '@/assets/images';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { FileQuestionIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ComponentProps } from 'react';

function NotFoundPage({ ...props }: ComponentProps<typeof Empty>) {
  return (
    <Empty {...props}>
      <EmptyHeader>
        <EmptyMedia>
          <Image src={IlusEmpty} alt="Empty" className="w-60" loading="eager" />
        </EmptyMedia>
        <EmptyTitle>Halaman Tidak Ditemukan</EmptyTitle>
        <EmptyDescription>
          Halaman yang ingin kamu akses tidak ada atau telah dipindahkan.
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
  );
}

function NotFoundData({
  data = 'Data',
  ...props
}: ComponentProps<typeof Empty> & {
  data?: string;
}) {
  return (
    <Empty {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>{data} Tidak Ditemukan</EmptyTitle>
      </EmptyHeader>
    </Empty>
  );
}

export { NotFoundPage, NotFoundData };
