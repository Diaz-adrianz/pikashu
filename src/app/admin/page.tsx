'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { GetAdminDashboardResponse } from '@/app/api/admin/dashboard/route';
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
  CardAction,
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
import { SeatTierOptionsMap } from '@/constants/options';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

const BOOKING_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu bayar',
  PAID: 'Dibayar',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
  COMPLETED: 'Selesai',
};

const REFUND_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  PROCESSING: 'Diproses',
  SUCCEEDED: 'Selesai',
  FAILED: 'Gagal',
};

export default function AdminPage() {
  const { item, isLoading } = useApi<GetAdminDashboardResponse>(
    '/api/admin/dashboard',
    {
      cache: 'fresh',
      onError: (err) => toast.error(err.message),
    }
  );

  return (
    <Page>
      <PageNav items={[{ label: 'Admin' }]} />
      <PageHeader
        title="Dasbor"
        description="Ringkasan operasional Pikashu."
        action={
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/refunds">Kelola refund</Link>
          </Button>
        }
      />

      {!item ? (
        <PageSection>
          <Card>
            <CardContent>
              {isLoading ? 'Memuat data...' : 'Data tidak tersedia.'}
            </CardContent>
          </Card>
        </PageSection>
      ) : (
        <>
          <PageSection>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Card size="sm">
                <CardContent>
                  <p className="typo-caption text-muted-foreground">
                    Total pendapatan
                  </p>
                  <p className="mt-1 typo-heading-sm">
                    {formatCurrency(item.totalRevenue)}
                  </p>
                </CardContent>
              </Card>
              {Object.entries(item.bookings).map(([status, count]) => (
                <Card size="sm" key={status}>
                  <CardContent>
                    <p className="typo-caption text-muted-foreground">
                      {BOOKING_LABELS[status] ?? status}
                    </p>
                    <p className="mt-1 typo-heading-sm">{count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </PageSection>

          <PageSection>
            <Card>
              <CardHeader>
                <CardTitle>Perjalanan mendatang</CardTitle>
                <CardAction>
                  <Button size="sm" variant="link" asChild>
                    <Link href="/admin/trips">Lihat semua</Link>
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rute</TableHead>
                        <TableHead>Berangkat</TableHead>
                        <TableHead>Armada</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Kursi (terjual/sisa)</TableHead>
                        <TableHead>Ocupancy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.upcomingTrips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>
                            <p className="typo-label">{trip.route.name}</p>
                            <small className="text-muted-foreground">
                              {trip.route.originCity} →{' '}
                              {trip.route.destinationCity}
                            </small>
                          </TableCell>
                          <TableCell>
                            {format(trip.departureAt, 'dd MMM yyyy HH:mm')}
                          </TableCell>
                          <TableCell>{trip.fleet.name}</TableCell>
                          <TableCell>
                            {SeatTierOptionsMap[trip.seatTier].label}
                          </TableCell>
                          <TableCell>{formatCurrency(trip.price)}</TableCell>
                          <TableCell>
                            {trip.sold}/{trip.available}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${trip.occupancy}%` }}
                                />
                              </div>
                              <span>{trip.occupancy}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!item.upcomingTrips.length && (
                        <TableRow>
                          <TableCell
                            className="text-center text-muted-foreground"
                            colSpan={7}
                          >
                            Tidak ada perjalanan mendatang.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </PageSection>

          <div className="grid gap-4 xl:grid-cols-2">
            <PageSection>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Transaksi terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Kode booking</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Dibayar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.transactions.map((payment) => (
                          <TableRow key={payment.orderId}>
                            <TableCell className="typo-label">
                              {payment.orderId}
                            </TableCell>
                            <TableCell>{payment.booking.code}</TableCell>
                            <TableCell>
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              {payment.paidAt
                                ? format(payment.paidAt, 'dd MMM yyyy HH:mm')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!item.transactions.length && (
                          <TableRow>
                            <TableCell
                              className="text-center text-muted-foreground"
                              colSpan={4}
                            >
                              Belum ada transaksi.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            <PageSection>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Refund terbaru</CardTitle>
                  <CardAction>
                    <Button size="sm" variant="link" asChild>
                      <Link href="/admin/refunds">Lihat semua</Link>
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode booking</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Alasan</TableHead>
                          <TableHead>Diajukan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.refunds.map((refund) => (
                          <TableRow key={refund.id}>
                            <TableCell className="typo-label">
                              {refund.payment.booking.code}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(refund.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  refund.status === 'SUCCEEDED'
                                    ? 'default'
                                    : refund.status === 'FAILED'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {REFUND_LABELS[refund.status] ?? refund.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-48 whitespace-normal">
                              {refund.reason}
                            </TableCell>
                            <TableCell>
                              {format(refund.createdAt, 'dd MMM yyyy HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!item.refunds.length && (
                          <TableRow>
                            <TableCell
                              className="text-center text-muted-foreground"
                              colSpan={5}
                            >
                              Belum ada refund.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          </div>
        </>
      )}
    </Page>
  );
}
