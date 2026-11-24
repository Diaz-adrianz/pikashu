'use client';

import { format } from 'date-fns';
import { QrCodeIcon, TicketsIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { GetStaffTripsResponse } from '@/app/api/staff/trips/route';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

export default function StaffPage() {
  const { item, isLoading } = useApi<GetStaffTripsResponse>('/api/staff/trips', {
    cache: 'fresh',
    onError: (err) => toast.error(err.message),
  });

  const trips = item ?? [];
  const passengers = trips.reduce((sum, trip) => sum + trip.passengers, 0);
  const boarded = trips.reduce((sum, trip) => sum + trip.boarded, 0);
  const notBoarded = passengers - boarded;

  const stats = [
    { label: 'Perjalanan ditugaskan', value: trips.length },
    { label: 'Total penumpang', value: passengers },
    { label: 'Sudah boarding', value: boarded },
    { label: 'Belum boarding', value: notBoarded },
  ];

  return (
    <Page>
      <PageNav items={[{ label: 'Staf' }]} />
      <PageHeader
        title="Dasbor Staf"
        description="Perjalanan yang ditugaskan kepada Anda."
      />

      <PageSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} size="sm">
              <CardContent>
                <p className="typo-caption text-muted-foreground">{stat.label}</p>
                <p className="typo-heading-lg mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Daftar perjalanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rute</TableHead>
                    <TableHead>Berangkat</TableHead>
                    <TableHead>Tiba</TableHead>
                    <TableHead>Armada</TableHead>
                    <TableHead>Penumpang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <p className="typo-label">{trip.route.name}</p>
                        <small className="text-muted-foreground">
                          {trip.route.originCity} → {trip.route.destinationCity}
                        </small>
                      </TableCell>
                      <TableCell>{formatDate(trip.departureAt)}</TableCell>
                      <TableCell>{formatDate(trip.arrivalAt)}</TableCell>
                      <TableCell>
                        <p className="typo-label">{trip.fleet.name}</p>
                        <small className="text-muted-foreground">
                          {trip.fleet.type === 'BUS' ? 'Bus' : 'Minibus'} ·{' '}
                          {trip.fleet.seatTier === 'ECONOMY'
                            ? 'Ekonomi'
                            : 'Bisnis'}
                        </small>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="default">{trip.boarded} boarding</Badge>
                          <Badge variant="outline">
                            {trip.notBoarded} belum
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            trip.status === 'SCHEDULED' ? 'default' : 'secondary'
                          }
                        >
                          {trip.status === 'SCHEDULED' ? 'Terjadwal' : 'Selesai'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/staff/manifest?trip=${trip.id}`}>
                              <TicketsIcon data-icon="inline-start" />
                              Manifest
                            </Link>
                          </Button>
                          <Button size="sm" variant="secondary" asChild>
                            <Link href={`/staff/scan?trip=${trip.id}`}>
                              <QrCodeIcon data-icon="inline-start" />
                              Pindai
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground">
                        Memuat perjalanan...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && trips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-muted-foreground">
                        Belum ada perjalanan yang ditugaskan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </PageSection>
    </Page>
  );
}
