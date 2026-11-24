'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import type { GetTicketResponse } from '@/app/api/tickets/[code]/route';
import type { GetTicketQrResponse } from '@/app/api/tickets/[code]/qr/route';
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
import { useApi } from '@/hooks/use-api';

export default function TicketPage() {
  const { code } = useParams<{ code: string }>();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && session?.user.role === 'PASSENGER';
  const { item: ticket, isLoading } = useApi<GetTicketResponse>(
    `/api/tickets/${code}`,
    { enabled, cache: 'fresh' }
  );
  const { item: qr } = useApi<GetTicketQrResponse>(
    `/api/tickets/${code}/qr`,
    { enabled: enabled && !!ticket && ticket.status === 'VALID', cache: 'fresh' }
  );

  return (
    <Page>
      <PageNav
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Pemesanan', href: '/bookings' },
          { label: 'Tiket' },
        ]}
      />
      {status === 'unauthenticated' && (
        <PageSection>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <p>Masuk untuk melihat tiket Anda.</p>
              <Button asChild>
                <Link
                  href={`/auth/login?callbackUrl=${encodeURIComponent(`/tickets/${code}`)}`}
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
          {!isLoading && !ticket ? (
            <PageSection>
              <Card>
                <CardContent>
                  <NotFoundData data="Tiket" />
                </CardContent>
              </Card>
            </PageSection>
          ) : (
            ticket && (
              <>
                <PageHeader
                  title={`Tiket ${ticket.code}`}
                  description="Tunjukkan QR Code ini kepada staf saat pemeriksaan."
                  action={
                    <div className="flex flex-wrap gap-2">
                      <Badge>{ticket.status}</Badge>
                      <Badge variant="secondary">{ticket.boardingStatus}</Badge>
                    </div>
                  }
                />
                <PageSection className="grid gap-4 lg:grid-cols-[1fr_2fr]">
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg">QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3">
                      {qr && ticket.status === 'VALID' ? (
                        <Image
                          src={qr.qr}
                          alt={`QR Code tiket ${ticket.code}`}
                          width={220}
                          height={220}
                          unoptimized
                          className="size-55 rounded-xl bg-card p-2"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          QR tidak tersedia untuk tiket ini.
                        </p>
                      )}
                      <p className="typo-caption text-muted-foreground">
                        QR dibuat sesuai permintaan dan hanya berlaku online.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detail tiket</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">Penumpang</span>
                        <br />
                        {ticket.passengerName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Kursi</span>
                        <br />
                        {ticket.seatNumber}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Rute</span>
                        <br />
                        {ticket.trip.route.originCity} →{' '}
                        {ticket.trip.route.destinationCity}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Armada</span>
                        <br />
                        {ticket.trip.fleet.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Berangkat</span>
                        <br />
                        {format(ticket.trip.departureAt, 'dd MMM yyyy HH:mm')}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Tiba</span>
                        <br />
                        {format(ticket.trip.arrivalAt, 'dd MMM yyyy HH:mm')}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Kelas kursi</span>
                        <br />
                        {ticket.trip.seatTier}
                      </p>
                      {ticket.boardedAt && (
                        <p>
                          <span className="text-muted-foreground">Dinaiki</span>
                          <br />
                          {format(ticket.boardedAt, 'dd MMM yyyy HH:mm')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </PageSection>
              </>
            )
          )}
        </>
      )}
    </Page>
  );
}
