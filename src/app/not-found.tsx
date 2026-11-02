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
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Image src={IlusEmpty} alt="Empty" className="w-60" />
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
    </div>
  );
}
