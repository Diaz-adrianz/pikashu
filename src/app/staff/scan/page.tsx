'use client';

import type { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { GetStaffTripsResponse } from '@/app/api/staff/trips/route';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { boardTicketAction } from '@/features/ticket/actions';
import { useApi } from '@/hooks/use-api';

type Feedback = { type: 'success' | 'error'; title: string; detail?: string };

const formatDate = (value: Date | string) =>
  format(new Date(String(value)), 'dd MMM yyyy HH:mm');

const cameraErrorMessage = (error: unknown) => {
  const err = error as { name?: string; message?: string };
  if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError')
    return 'Izin kamera ditolak. Aktifkan izin kamera di browser, lalu coba lagi.';
  if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError')
    return 'Kamera tidak ditemukan pada perangkat ini.';
  if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError')
    return 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut, lalu coba lagi.';
  return `Gagal membuka kamera: ${err?.message ?? 'kesalahan tidak diketahui'}`;
};

function ScanPanel({ disabled }: { disabled: boolean }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);
  const generationRef = useRef(0);
  const cooldownRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
      cooldownRef.current = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;
      void (async () => {
        try {
          if (scanner.isScanning) await scanner.stop();
        } catch {
          // Camera already stopped.
        }
        try {
          scanner.clear();
        } catch {
          // Element already cleared.
        }
      })();
    };
  }, []);

  const clearScanner = async () => {
    cooldownRef.current = false;
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        if (scanner.isScanning) await scanner.stop();
      } catch {
        // Camera already stopped.
      }
      try {
        scanner.clear();
      } catch {
        // Element already cleared.
      }
    }
    if (mountedRef.current) setScanning(false);
  };

  const stopScanner = async () => {
    generationRef.current += 1;
    await clearScanner();
  };

  const submitToken = async (raw: string) => {
    const token = raw.trim();
    if (!token) {
      setFeedback({ type: 'error', title: 'Masukkan token QR terlebih dahulu.' });
      return false;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await boardTicketAction({ token });
      if (!res.ok) {
        setFeedback({
          type: 'error',
          title: 'Pindai ditolak',
          detail: res.message,
        });
        return false;
      }
      const data = res.data;
      if (data.alreadyBoarded) {
        setFeedback({
          type: 'error',
          title: 'Tiket sudah dipindai',
          detail: `${data.passengerName} · Kursi ${data.seatNumber} sudah boarding.`,
        });
        return false;
      }
      setFeedback({
        type: 'success',
        title: 'Boarding berhasil',
        detail: `${data.passengerName} · Kursi ${data.seatNumber} · ${data.code}`,
      });
      setManualToken('');
      return true;
    } catch {
      setFeedback({
        type: 'error',
        title: 'Pindai gagal',
        detail: 'Server terjadi masalah',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const startScanner = async () => {
    if (disabled) return;
    setCameraError(null);
    setFeedback(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Browser tidak mendukung kamera. Gunakan HTTPS dan browser modern, atau input manual.'
      );
      return;
    }

    const runId = ++generationRef.current;
    await clearScanner();

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        'html5-qrcode'
      );
      if (!mountedRef.current || runId !== generationRef.current) return;

      const scanner = new Html5Qrcode('staff-qr-reader', {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cooldownRef.current || !mountedRef.current) return;
          cooldownRef.current = true;
          void submitToken(decodedText).finally(() => {
            window.setTimeout(() => {
              cooldownRef.current = false;
            }, 1500);
          });
        },
        () => {}
      );

      if (!mountedRef.current || runId !== generationRef.current) {
        await clearScanner();
        return;
      }
      setScanning(true);
    } catch (error) {
      if (runId === generationRef.current) {
        await clearScanner();
        setCameraError(cameraErrorMessage(error));
      }
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Pemindai QR</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => void startScanner()}
                disabled={scanning || disabled}
              >
                {scanning ? 'Kamera aktif' : 'Mulai kamera'}
              </Button>
              {scanning && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void stopScanner()}
                >
                  Hentikan
                </Button>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-white">
            <div
              id="staff-qr-reader"
              className="[&_video]:h-auto [&_video]:w-full"
            />
            {!scanning && (
              <div className="absolute inset-0 grid place-items-center bg-white/80 text-sm text-muted-foreground">
                {disabled ? 'Pilih perjalanan terlebih dahulu' : 'Kamera belum aktif'}
              </div>
            )}
          </div>

          {!!cameraError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {cameraError} Gunakan input manual di bawah.
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            Validasi dilakukan secara online. Hanya tiket berlaku dan belum
            boarding pada perjalanan yang ditugaskan yang dapat dipindai.
          </p>
        </CardContent>
      </Card>

      {!!feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border p-3 text-sm ${
            feedback.type === 'success'
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-destructive bg-destructive/10 text-destructive'
          }`}
        >
          <p className="typo-label">{feedback.title}</p>
          {!!feedback.detail && <p>{feedback.detail}</p>}
        </div>
      )}

      <Card>
        <CardContent>
          <CardTitle className="mb-1">Input manual</CardTitle>
          <p className="mb-3 text-sm text-muted-foreground">
            Gunakan jika kamera tidak tersedia atau izin kamera ditolak.
          </p>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void submitToken(manualToken);
            }}
          >
            <Input
              value={manualToken}
              onChange={(event) => setManualToken(event.target.value)}
              placeholder="Tempel token QR"
              autoComplete="off"
              disabled={submitting || disabled}
            />
            <Button
              type="submit"
              disabled={submitting || disabled || !manualToken.trim()}
            >
              Kirim
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { item: trips, isLoading } = useApi<GetStaffTripsResponse>(
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

  return (
    <PageSection>
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Perjalanan</CardTitle>
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
                router.replace(`/staff/scan?trip=${value}`)
              }
              disabled={isLoading || !trips?.length}
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
        </CardContent>
      </Card>

      <ScanPanel key={tripId ?? 'none'} disabled={!tripId} />
    </PageSection>
  );
}

export default function ScanPage() {
  return (
    <Page>
      <PageNav
        items={[{ label: 'Staf', href: '/staff' }, { label: 'Pindai QR' }]}
      />
      <PageHeader title="Pindai QR Tiket" />
      <Suspense
        fallback={
          <PageSection>
            <Card>
              <CardContent className="text-muted-foreground">
                Memuat pemindai...
              </CardContent>
            </Card>
          </PageSection>
        }
      >
        <ScanContent />
      </Suspense>
    </Page>
  );
}
