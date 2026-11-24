'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import type { GetBookingsResponse } from '@/app/api/bookings/route';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Search } from '@/components/shared/search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiPaginate } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

const STATUSES = [
  { value: '', label: 'Semua status' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu pembayaran' },
  { value: 'PAID', label: 'Dibayar' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
  { value: 'EXPIRED', label: 'Kedaluwarsa' },
];

const statusLabel = (status: string) =>
  STATUSES.find((s) => s.value === status)?.label ?? status;

const statusVariant = (status: string) =>
  status === 'PAID' || status === 'COMPLETED'
    ? ('default' as const)
    : status === 'CANCELLED' || status === 'EXPIRED'
      ? ('destructive' as const)
      : ('secondary' as const);

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState({ status: '', code: '' });
  const enabled = status === 'authenticated' && session?.user.role === 'PASSENGER';

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
  } = useApiPaginate<GetBookingsResponse>('/api/bookings', {
    params: { status: filter.status },
    enabled,
    limit: 10,
  });

  const visible = items.filter((item) =>
    item.code.toLowerCase().includes(filter.code.toLowerCase())
  );
  const upcoming = visible
    .filter((item) => ['PAID', 'PENDING_PAYMENT'].includes(item.status))
    .slice(0, 3);

  return (
    <Page>
      <PageNav
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Pemesanan Saya' },
        ]}
      />
      <PageHeader
        title="Pemesanan Saya"
        description="Lihat perjalanan mendatang dan riwayat pemesanan Anda."
      />

      {status === 'unauthenticated' && (
        <PageSection>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <p>Masuk untuk melihat pemesanan Anda.</p>
              <Button asChild>
                <Link
                  href={`/auth/login?callbackUrl=${encodeURIComponent('/bookings')}`}
                >
                  Masuk
                </Link>
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      )}

      {enabled && (
        <>
          {upcoming.length > 0 && (
            <PageSection>
              <h2 className="typo-heading-md">Perjalanan mendatang</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {upcoming.map((item) => (
                  <Card key={item.code} className="border-primary/30">
                    <CardContent className="grid gap-1">
                      <p className="typo-caption text-primary">{item.code}</p>
                      <p className="font-medium">{item.trip.route.name}</p>
                      <p className="typo-caption text-muted-foreground">
                        {format(item.trip.departureAt, 'dd MMM yyyy HH:mm')} ·{' '}
                        {item.trip.fleet.name}
                      </p>
                      <Button size="sm" variant="secondary" className="mt-2" asChild>
                        <Link href={`/bookings/${item.code}`}>Lihat detail</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </PageSection>
          )}

          <PageSection>
            <div className="flex flex-wrap gap-2">
              <Search
                className="min-w-56 flex-1"
                placeholder="Cari kode pemesanan..."
                onSearch={(code) =>
                  setFilter((prev) => ({ ...prev, code }))
                }
              />
              <Select
                value={filter.status}
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="w-56" aria-label="Filter status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUSES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {visible.map((item) => (
                <Card key={item.code}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4">
                    <div className="grid gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.code}</p>
                        <Badge variant={statusVariant(item.status)}>
                          {statusLabel(item.status)}
                        </Badge>
                        {item.payment && (
                          <Badge variant="outline">{item.payment.status}</Badge>
                        )}
                      </div>
                      <p className="text-sm">{item.trip.route.name}</p>
                      <p className="typo-caption text-muted-foreground">
                        {format(item.trip.departureAt, 'dd MMM yyyy HH:mm')} ·{' '}
                        {item.tickets.length} tiket ·{' '}
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.status === 'PENDING_PAYMENT' && (
                        <Button size="sm" asChild>
                          <Link href={`/bookings/${item.code}/payment`}>
                            Bayar
                          </Link>
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/bookings/${item.code}`}>Detail</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!isLoading && !visible.length && (
                <Empty>
                  <EmptyHeader>
                    <EmptyDescription>
                      Belum ada pemesanan yang cocok.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              {isLoading && (
                <p className="py-8 text-center text-muted-foreground">
                  Memuat pemesanan...
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <p className="me-auto typo-caption text-muted-foreground">
                {total} pemesanan
              </p>
              {hasPrev && (
                <Button size="sm" variant="secondary" onClick={prev}>
                  <ChevronLeftIcon data-icon="inline-start" />
                  Prev
                </Button>
              )}
              <span className="typo-caption">
                {page} / {Math.max(1, Math.ceil(total / limit))}
              </span>
              {hasNext && (
                <Button size="sm" variant="secondary" onClick={next}>
                  Next
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
              )}
            </div>
          </PageSection>
        </>
      )}
    </Page>
  );
}
