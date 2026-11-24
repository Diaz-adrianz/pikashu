import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, LuggageIcon } from 'lucide-react';
import { Page, PageHeader, PageSection } from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { readFacilities } from '@/features/facility/services';
import { OptionalServiceStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Fasilitas | Pikashu',
  description:
    'Lihat fasilitas armada ekonomi dan bisnis, serta layanan tambahan yang bisa dipilih saat checkout.',
};

type Facility = Awaited<ReturnType<typeof readFacilities>>['items'][number];

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <Card className="h-full overflow-hidden pt-0">
      <div className="relative aspect-video bg-muted">
        <Image
          src={`/api/uploads/${facility.image}`}
          alt={facility.title}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="typo-heading-sm">{facility.title}</CardTitle>
          <Badge variant="secondary">
            {facility.seatTier === 'ECONOMY' ? 'Ekonomi' : 'Bisnis'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="typo-body-sm text-muted-foreground">
          {facility.description}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function FacilitiesPage() {
  const [facilities, services] = await Promise.all([
    readFacilities({ page: 1, limit: 100 }),
    prisma.optionalService.findMany({
      where: { status: OptionalServiceStatus.ACTIVE },
      orderBy: { name: 'asc' },
      take: 12,
    }),
  ]);

  const economy = facilities.items.filter(
    (item) => item.seatTier === 'ECONOMY'
  );
  const business = facilities.items.filter(
    (item) => item.seatTier === 'BUSINESS'
  );

  return (
    <Page className="bg-background">
      <PageSection className="grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="grid gap-5">
          <h1 className="max-w-2xl typo-display">
            Fasilitas yang mengikuti kelas kursi
          </h1>
          <p className="max-w-xl typo-lead">
            Setiap armada memakai satu kelas kursi. Fasilitas yang tampil pada
            perjalanan mengikuti kelas tersebut, supaya kamu tahu apa yang
            didapat sebelum memilih kursi.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/trips">
                Lihat perjalanan
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <LuggageIcon />
            <CardTitle>Layanan tambahan</CardTitle>
            <CardDescription>
              Dipilih saat checkout, sebelum pembayaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="typo-body-sm text-muted-foreground">
            Kuota layanan mengikuti pengaturan tiap perjalanan. Harga yang
            dipakai adalah harga yang tercatat saat perjalanan dibuat.
          </CardContent>
        </Card>
      </PageSection>

      <PageSection className="grid gap-6 pb-6">
        <PageHeader
          className="mb-0 px-0"
          title="Kelas ekonomi"
          description="Fasilitas dasar untuk perjalanan harian."
        />
        {economy.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {economy.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada fasilitas ekonomi</EmptyTitle>
              <EmptyDescription>
                Fasilitas akan muncul setelah ditambahkan administrator.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </PageSection>

      <PageSection className="grid gap-6 pb-14 lg:pb-20">
        <PageHeader
          className="mb-0 px-0"
          title="Kelas bisnis"
          description="Fasilitas untuk perjalanan yang lebih jauh."
        />
        {business.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {business.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada fasilitas bisnis</EmptyTitle>
              <EmptyDescription>
                Fasilitas akan muncul setelah ditambahkan administrator.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </PageSection>

      <PageSection className="mb-8 grid gap-6 rounded-3xl bg-muted p-6 md:p-10">
        <div className="grid gap-2">
          <h2 className="typo-heading-lg">Layanan yang bisa ditambahkan</h2>
          <p className="typo-body-md text-muted-foreground">
            Pilih layanan saat checkout. Total pembayaran mengikuti harga pada
            perjalanan yang kamu pesan.
          </p>
        </div>
        {services.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <CardTitle className="typo-heading-sm">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <p className="typo-body-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <p className="typo-label">{formatCurrency(service.price)}</p>
                  <p className="typo-caption text-muted-foreground">
                    {service.capacity === null
                      ? 'Kuota tidak terbatas'
                      : `Kuota ${service.capacity} per perjalanan`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada layanan tambahan</EmptyTitle>
              <EmptyDescription>
                Layanan akan muncul setelah ditambahkan administrator.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </PageSection>
    </Page>
  );
}
