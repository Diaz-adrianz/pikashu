'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import type { GetBookingResponse } from '@/app/api/bookings/[code]/route';
import { useConfirm } from '@/components/shared/confirm';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cancelBookingAction } from '@/features/booking/actions';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

export default function BookingDetailPage() {
  const { code } = useParams<{ code: string }>();
  const confirm = useConfirm();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && session?.user.role === 'PASSENGER';
  const { item: booking, isLoading, refresh } = useApi<GetBookingResponse>(
    `/api/bookings/${code}`,
    { enabled, cache: 'fresh' }
  );
  const { run: cancel, isLoading: isCancelling } = useAction(
    cancelBookingAction,
    {
      successMessage: 'Pemesanan dibatalkan',
      onSuccess: () => refresh(),
    }
  );

  // Server enforces departure cutoff; UI only gates by cancellable status.
  const canCancel =
    !!booking && ['PENDING_PAYMENT', 'PAID', 'COMPLETED'].includes(booking.status);

  const onCancel = async () => {
    const ok = await confirm({
      title: `Batalkan pemesanan ${code}?`,
      description:
        booking?.payment?.status === 'PAID'
          ? 'Pembayaran sudah diterima. Refund akan diproses sesuai kebijakan.'
          : 'Kursi yang dipesan akan dilepaskan.',
      confirmVariant: 'destructive',
    });
    if (ok) cancel(code);
  };

  return (
    <Page>
      <PageNav
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Pemesanan', href: '/bookings' },
          { label: code },
        ]}
      />
      {status === 'unauthenticated' && (
        <PageSection>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <p>Masuk untuk melihat detail pemesanan Anda.</p>
              <Button asChild>
                <Link
                  href={`/auth/login?callbackUrl=${encodeURIComponent(`/bookings/${code}`)}`}
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
          {isLoading && <LoadingOverlay />}
          {!isLoading && !booking ? (
            <PageSection>
              <Card>
                <CardContent>
                  <NotFoundData data="Pemesanan" />
                </CardContent>
              </Card>
            </PageSection>
          ) : (
            booking && (
              <>
                <PageHeader
                  title={`Pemesanan ${booking.code}`}
                  description={`Dibuat ${format(booking.createdAt, 'dd MMM yyyy HH:mm')}`}
                  action={
                    <div className="flex flex-wrap gap-2">
                      <Badge>{booking.status}</Badge>
                      {booking.payment && (
                        <Badge variant="secondary">
                          Pembayaran: {booking.payment.status}
                        </Badge>
                      )}
                    </div>
                  }
                />

                <PageSection className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detail perjalanan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm">
                      <p className="font-medium">{booking.trip.route.name}</p>
                      <p className="text-muted-foreground">
                        {booking.trip.route.originCity} →{' '}
                        {booking.trip.route.destinationCity}
                      </p>
                      <p>
                        Berangkat:{' '}
                        {format(booking.trip.departureAt, 'dd MMM yyyy HH:mm')}
                      </p>
                      <p>
                        Tiba: {format(booking.trip.arrivalAt, 'dd MMM yyyy HH:mm')}
                      </p>
                      <p>Armada: {booking.trip.fleet.name}</p>
                      <p>Kelas: {booking.trip.seatTier}</p>
                      <p className="pt-2 font-semibold text-primary">
                        Total {formatCurrency(booking.totalAmount)}
                      </p>
                      {booking.status === 'PENDING_PAYMENT' && (
                        <Button className="mt-2" asChild>
                          <Link href={`/bookings/${booking.code}/payment`}>
                            Lanjut bayar
                          </Link>
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tiket</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      {booking.tickets.map((ticket) => (
                        <div
                          key={ticket.code}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {ticket.passengerName} · Kursi {ticket.seatNumber}
                            </p>
                            <p className="typo-caption text-muted-foreground">
                              {ticket.code} · {ticket.status} ·{' '}
                              {ticket.boardingStatus}
                            </p>
                          </div>
                          {ticket.status === 'VALID' && (
                            <Button size="sm" variant="secondary" asChild>
                              <Link href={`/tickets/${ticket.code}`}>
                                Lihat tiket
                              </Link>
                            </Button>
                          )}
                        </div>
                      ))}
                      {!booking.tickets.length && (
                        <p className="text-sm text-muted-foreground">
                          Belum ada tiket.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </PageSection>

                {booking.optionalServices.length > 0 && (
                  <PageSection>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Layanan tambahan</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-2 text-sm">
                        {booking.optionalServices.map((service) => (
                          <div key={service.id} className="flex justify-between">
                            <span>
                              {service.name} × {service.quantity}
                            </span>
                            <span>
                              {formatCurrency(service.price * service.quantity)}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </PageSection>
                )}

                {!!booking.payment?.refunds.length && (
                  <PageSection>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Refund</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-2 text-sm">
                        {booking.payment.refunds.map((refund) => (
                          <div
                            key={refund.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                          >
                            <div>
                              <p className="font-medium">
                                {formatCurrency(refund.amount)}
                              </p>
                              <p className="typo-caption text-muted-foreground">
                                {refund.reason} ·{' '}
                                {format(refund.createdAt, 'dd MMM yyyy HH:mm')}
                              </p>
                            </div>
                            <Badge variant="secondary">{refund.status}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </PageSection>
                )}

                {canCancel && (
                  <PageSection>
                    <Button
                      variant="destructive"
                      disabled={isCancelling}
                      onClick={onCancel}
                    >
                      Batalkan pemesanan
                    </Button>
                  </PageSection>
                )}
              </>
            )
          )}
        </>
      )}
    </Page>
  );
}
