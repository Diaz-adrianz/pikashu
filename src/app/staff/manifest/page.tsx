'use client';

import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import type { GetStaffManifestResponse } from '@/app/api/staff/trips/[tripId]/manifest/route';
import type { GetStaffTripsResponse } from '@/app/api/staff/trips/route';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApi } from '@/hooks/use-api';

const formatDate = (value: Date | string) =>
  format(new Date(String(value)), 'dd MMM yyyy HH:mm');

function ManifestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { item: trips, isLoading: tripsLoading } = useApi<GetStaffTripsResponse>(
    '/api/staff/trips',
    {
      cache: 'fresh',
      onError: (err) => toast.error(err.message),
    }
  );

  const queryTrip = searchParams.get('trip');
  const tripId =
    (queryTrip && trips?.some((trip) => trip.id === queryTrip)
      ? queryTrip
      : trips?.[0]?.id) || undefined;
  const selectedTrip = trips?.find((trip) => trip.id === tripId);

  const { item: manifest, isLoading } = useApi<GetStaffManifestResponse>(
    `/api/staff/trips/${tripId}/manifest`,
    {
      enabled: Boolean(tripId),
      cache: 'fresh',
      onError: (err) => toast.error(err.message),
    }
  );

  return (
    <PageSection>
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Manifest penumpang</CardTitle>
              {!!selectedTrip && (
                <p className="typo-caption text-muted-foreground">
                  {selectedTrip.route.originCity} →{' '}
                  {selectedTrip.route.destinationCity} ·{' '}
                  {formatDate(selectedTrip.departureAt)}
                </p>
              )}
            </div>
            <Select
              value={tripId ?? ''}
              onValueChange={(value) =>
                router.replace(`/staff/manifest?trip=${value}`)
              }
              disabled={tripsLoading || !trips?.length}
            >
              <SelectTrigger aria-label="Pilih perjalanan" className="w-full sm:w-80">
                <SelectValue placeholder="Pilih perjalanan" />
              </SelectTrigger>
              <SelectContent>
                {(trips ?? []).map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.route.originCity} → {trip.route.destinationCity} ·{' '}
                    {formatDate(trip.departureAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode pemesanan</TableHead>
                  <TableHead>Kode tiket</TableHead>
                  <TableHead>Penumpang</TableHead>
                  <TableHead>Kursi</TableHead>
                  <TableHead>Status tiket</TableHead>
                  <TableHead>Status boarding</TableHead>
                  <TableHead>Waktu boarding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(manifest ?? []).map((row) => (
                  <TableRow key={row.code}>
                    <TableCell>{row.booking.code}</TableCell>
                    <TableCell className="typo-label">{row.code}</TableCell>
                    <TableCell>{row.passengerName}</TableCell>
                    <TableCell>{row.seatNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === 'VALID' ? 'default' : 'destructive'
                        }
                      >
                        {row.status === 'VALID' ? 'Berlaku' : 'Dibatalkan'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.boardingStatus === 'BOARDED'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {row.boardingStatus === 'BOARDED'
                          ? 'Sudah boarding'
                          : 'Belum boarding'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.boardedAt ? formatDate(row.boardedAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Memuat manifest...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && tripId && (manifest ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Belum ada tiket untuk perjalanan ini.
                    </TableCell>
                  </TableRow>
                )}
                {!tripId && !tripsLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Pilih perjalanan terlebih dahulu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageSection>
  );
}

export default function ManifestPage() {
  return (
    <Page>
      <PageNav
        items={[{ label: 'Staf', href: '/staff' }, { label: 'Manifest' }]}
      />
      <PageHeader title="Manifest Penumpang" />
      <Suspense
        fallback={
          <PageSection>
            <Card>
              <CardContent className="text-muted-foreground">
                Memuat manifest...
              </CardContent>
            </Card>
          </PageSection>
        }
      >
        <ManifestContent />
      </Suspense>
    </Page>
  );
}
