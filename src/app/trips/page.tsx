'use client';

import { Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  UsersIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { GetTripsResponse } from '@/app/api/trips/route';
import { NotFoundData } from '@/components/shared/not-found';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SeatTierOptionsMap } from '@/constants/options';
import { useApiPaginate } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

const SORTS = [
  { value: 'departure_asc', label: 'Berangkat tercepat' },
  { value: 'departure_desc', label: 'Berangkat terakhir' },
  { value: 'price_asc', label: 'Harga terendah' },
  { value: 'price_desc', label: 'Harga tertinggi' },
];

function Results() {
  const searchParams = useSearchParams();
  const [sort, setSort] = useState(searchParams.get('sort') ?? SORTS[0].value);

  const params = useMemo(
    () => ({
      originCity: searchParams.get('originCity') ?? '',
      destinationCity: searchParams.get('destinationCity') ?? '',
      departureDate: searchParams.get('departureDate') ?? '',
      seats: searchParams.get('seats') ?? '1',
      seatTier: searchParams.get('seatTier') ?? '',
      sort,
    }),
    [searchParams, sort]
  );

  const {
    items,
    total,
    page,
    limit,
    hasNext,
    hasPrev,
    next,
    prev,
    isLoading,
  } = useApiPaginate<GetTripsResponse>('/api/trips', { params, limit: 10 });

  const origin = params.originCity;
  const destination = params.destinationCity;

  return (
    <Page>
      <PageNav
        items={[{ label: 'Beranda', href: '/' }, { label: 'Perjalanan' }]}
      />
      <PageHeader
        title="Cari Perjalanan"
        description={
          origin || destination
            ? `${origin || 'Semua kota'} → ${destination || 'Semua kota'}`
            : 'Pilih perjalanan yang tersedia untuk Anda'
        }
        action={
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-56" aria-label="Urutkan">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <PageSection>
        {!isLoading && !items.length ? (
          <Card>
            <CardContent>
              <NotFoundData data="Perjalanan" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((trip) => {
              const image = trip.fleet.images[0];
              return (
                <Card key={trip.id}>
                  {image && (
                    <div className="relative h-40 w-full bg-muted">
                      <Image
                        src={`/api/uploads/${image.path}`}
                        alt={trip.fleet.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid">
                        <h2 className="typo-heading-sm">{trip.route.name}</h2>
                        <p className="typo-caption text-muted-foreground">
                          {trip.fleet.name}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {SeatTierOptionsMap[trip.seatTier].label}
                      </Badge>
                    </div>
                    <p className="flex items-center gap-2 text-sm">
                      <MapPinIcon className="size-4 text-primary" />
                      {trip.route.originCity} → {trip.route.destinationCity}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Berangkat</span>
                        <br />
                        {format(trip.departureAt, 'dd MMM yyyy HH:mm')}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Tiba</span>
                        <br />
                        {format(trip.arrivalAt, 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <div>
                        <p className="text-lg font-semibold text-primary">
                          {formatCurrency(trip.price)}
                        </p>
                        <p className="flex items-center gap-1 typo-caption text-muted-foreground">
                          <UsersIcon className="size-3" />
                          {trip.available} kursi tersedia
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/trips/${trip.id}`}>Detail</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {isLoading && (
          <p className="py-8 text-center text-muted-foreground">
            Memuat perjalanan...
          </p>
        )}
        <CardFooter className="gap-2">
          <p className="me-auto typo-caption text-muted-foreground">
            {total} perjalanan
          </p>
          {hasPrev && (
            <Button size="sm" variant="secondary" onClick={prev}>
              <ChevronLeftIcon />
              Prev
            </Button>
          )}
          <span className="typo-caption">
            {page} / {Math.max(1, Math.ceil(total / limit))}
          </span>
          {hasNext && (
            <Button size="sm" variant="secondary" onClick={next}>
              Next
              <ChevronRightIcon />
            </Button>
          )}
        </CardFooter>
      </PageSection>
    </Page>
  );
}

export default function TripsPage() {
  return (
    <Suspense fallback={<Page className="bg-background" />}>
      <Results />
    </Suspense>
  );
}
