'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { GetBookingResponse } from '@/app/api/bookings/[code]/route';
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
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { createPaymentAction } from '@/features/booking/actions';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

type SnapOptions = {
  onSuccess: () => void;
  onPending: () => void;
  onError: () => void;
  onClose: () => void;
};
type Snap = { pay: (token: string, options: SnapOptions) => void };

const SNAP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js';
const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '';

let snapLoader: Promise<Snap> | null = null;

function loadSnap(): Promise<Snap> {
  if (snapLoader) return snapLoader;
  snapLoader = new Promise<Snap>((resolve, reject) => {
    const win = window as Window & { snap?: Snap };
    if (win.snap) {
      resolve(win.snap);
      return;
    }
    const script = document.createElement('script');
    script.src = SNAP_URL;
    script.async = true;
    script.setAttribute('data-client-key', CLIENT_KEY);
    script.onload = () =>
      win.snap ? resolve(win.snap) : reject(new Error('Midtrans tidak tersedia'));
    script.onerror = () => {
      snapLoader = null;
      reject(new Error('Gagal memuat Midtrans'));
    };
    document.body.appendChild(script);
  });
  return snapLoader;
}

export default function PaymentPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && session?.user.role === 'PASSENGER';
  const { item: booking, isLoading, refresh } = useApi<GetBookingResponse>(
    `/api/bookings/${code}`,
    { enabled, cache: 'fresh' }
  );

  const [now, setNow] = useState(() => Date.now());
  const [token, setToken] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const { run: createPayment, isLoading: isCreating } = useAction(
    createPaymentAction,
    {
      onSuccess: (data) => setToken(data.token),
    }
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/bookings/${code}/sync`, {
        method: 'POST',
      });
      if (!res.ok) {
        toast.error('Gagal memperbarui status pembayaran');
        return;
      }
      const updated = await refresh();
      if (updated?.data?.status === 'PAID') {
        toast.success('Pembayaran terverifikasi');
        router.push(`/bookings/${code}`);
      } else {
        toast.info('Status pembayaran belum terverifikasi');
      }
    } catch {
      toast.error('Gagal memperbarui status pembayaran');
    } finally {
      setSyncing(false);
    }
  }, [code, refresh, router]);

  const expiresAt = booking ? Date.parse(String(booking.expiresAt)) : 0;
  const remaining = Math.max(0, expiresAt - now);
  const minutes = String(Math.floor(remaining / 60_000)).padStart(2, '0');
  const seconds = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0');
  const expired =
    !!booking && (remaining === 0 || booking.status !== 'PENDING_PAYMENT');

  const openSnap = () => {
    if (!token) return toast.error('Token pembayaran belum tersedia');
    loadSnap()
      .then((snap) =>
        snap.pay(token, {
          onSuccess: () => void sync(),
          onPending: () => void sync(),
          onError: () => toast.error('Pembayaran gagal'),
          onClose: () => void sync(),
        })
      )
      .catch((error: Error) => toast.error(error.message));
  };

  return (
    <Page>
      <PageNav
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Pemesanan', href: '/bookings' },
          { label: code },
          { label: 'Pembayaran' },
        ]}
      />
      {status === 'unauthenticated' && (
        <PageSection>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <p>Masuk untuk membayar pemesanan Anda.</p>
              <Button asChild>
                <Link
                  href={`/auth/login?callbackUrl=${encodeURIComponent(`/bookings/${code}/payment`)}`}
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
                  title={`Pembayaran ${booking.code}`}
                  description="Selesaikan pembayaran sebelum waktu hold berakhir."
                  action={
                    <Badge variant={expired ? 'destructive' : 'secondary'}>
                      {expired ? 'Waktu habis' : `${minutes}:${seconds}`}
                    </Badge>
                  }
                />
                <PageSection className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ringkasan pemesanan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <span>Perjalanan</span>
                        <span className="text-right font-medium">
                          {booking.trip.route.name}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Berangkat</span>
                        <span>
                          {format(booking.trip.departureAt, 'dd MMM yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Tiket</span>
                        <span className="text-right">
                          {booking.tickets
                            .map((t) => `Kursi ${t.seatNumber} (${t.passengerName})`)
                            .join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Harga tiket ({booking.tickets.length})</span>
                        <span>
                          {formatCurrency(booking.trip.price * booking.tickets.length)}
                        </span>
                      </div>
                      {booking.optionalServices.map((service) => (
                        <div key={service.id} className="flex justify-between gap-2">
                          <span>
                            {service.name} × {service.quantity}
                          </span>
                          <span>
                            {formatCurrency(service.price * service.quantity)}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total pembayaran</span>
                        <span className="text-primary">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-lg">Bayar sekarang</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      {expired ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Waktu pembayaran telah habis. Pemesanan tidak dapat
                            dibayar lagi.
                          </p>
                          <Button variant="secondary" asChild>
                            <Link href="/bookings">Kembali ke pemesanan</Link>
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="typo-caption text-muted-foreground">
                            Sisa waktu: {minutes}:{seconds} sejak waktu kedaluwarsa
                            server.
                          </p>
                          {!token ? (
                            <Button
                              disabled={isCreating}
                              onClick={() => createPayment(booking.id)}
                            >
                              {isCreating && <Spinner data-icon="inline-start" />}
                              {isCreating ? 'Menyiapkan pembayaran...' : 'Bayar'}
                            </Button>
                          ) : (
                            <Button onClick={openSnap}>
                              Lanjutkan dengan Midtrans
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            disabled={syncing}
                            onClick={() => void sync()}
                          >
                            {syncing && <Spinner data-icon="inline-start" />}
                            {syncing ? 'Memperbarui...' : 'Perbarui status'}
                          </Button>
                        </>
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
