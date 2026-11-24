'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import type { GetTripResponse } from '@/app/api/trips/[id]/route';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { createBookingAction } from '@/features/booking/actions';
import { getSeatLayout } from '@/features/trip/seat-layout';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { cn, formatCurrency } from '@/lib/utils';

function Checkout() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { item: trip, isLoading } = useApi<GetTripResponse>(`/api/trips/${id}`);

  const [selected, setSelected] = useState<string[]>(() =>
    (searchParams.get('seats') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const [names, setNames] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { run: create, isLoading: isCreating } = useAction(
    createBookingAction,
    {
      successMessage: 'Pemesanan dibuat. Selesaikan pembayaran Anda.',
      onSuccess: (booking) => router.push(`/bookings/${booking.code}/payment`),
    }
  );

  const layout = trip ? getSeatLayout(trip.fleet.type) : null;
  const occupied = new Set(trip?.occupiedSeats ?? []);
  const chosen = selected.filter(
    (number) =>
      layout?.seats.some((seat) => seat.number === number) && !occupied.has(number)
  );
  const defaultName = session?.user.name ?? '';
  const services = trip?.optionalServices ?? [];
  const total =
    (trip?.price ?? 0) * chosen.length +
    services.reduce(
      (sum, service) => sum + service.price * (quantities[service.serviceId] ?? 0),
      0
    );

  const toggleSeat = (number: string) =>
    setSelected((prev) =>
      prev.includes(number)
        ? prev.filter((s) => s !== number)
        : [...prev, number].sort((a, b) => Number(a) - Number(b))
    );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chosen.length) return toast.error('Pilih minimal satu kursi');
    if (
      chosen.some((number) => (names[number] ?? defaultName).trim().length < 3)
    )
      return toast.error('Nama penumpang minimal 3 karakter');

    create({
      tripId: id,
      passengers: chosen.map((number) => ({
        seatNumber: number,
        passengerName: (names[number] ?? defaultName).trim(),
      })),
      services: services
        .filter((service) => (quantities[service.serviceId] ?? 0) > 0)
        .map((service) => ({
          serviceId: service.serviceId,
          quantity: quantities[service.serviceId],
        })),
    });
  };

  const callback = `/trips/${id}/checkout${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  return (
    <Page>
      <PageNav
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Perjalanan', href: '/trips' },
          { label: 'Detail', href: `/trips/${id}` },
          { label: 'Pemesanan' },
        ]}
      />
      <PageHeader
        title="Pemesanan Tiket"
        description="Periksa kursi, data penumpang, dan layanan tambahan sebelum melanjutkan."
      />
      {isLoading && <LoadingOverlay />}
      {!isLoading && !trip ? (
        <PageSection>
          <Card>
            <CardContent>
              <NotFoundData data="Perjalanan" />
            </CardContent>
          </Card>
        </PageSection>
      ) : (
        trip && (
          <form onSubmit={onSubmit}>
            <PageSection className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{trip.route.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Rute</span>
                      <br />
                      {trip.route.originCity} → {trip.route.destinationCity}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Berangkat</span>
                      <br />
                      {format(trip.departureAt, 'dd MMM yyyy HH:mm')}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Armada</span>
                      <br />
                      {trip.fleet.name}
                    </p>
                    <Badge variant="secondary">{trip.seatTier}</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kursi & penumpang</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {status === 'unauthenticated' && (
                      <Alert className="flex flex-wrap items-center justify-between gap-2">
                        <AlertDescription>
                          Masuk untuk melanjutkan pemesanan.
                        </AlertDescription>
                        <Button size="sm" asChild>
                          <Link
                            href={`/auth/login?callbackUrl=${encodeURIComponent(callback)}`}
                          >
                            Masuk
                          </Link>
                        </Button>
                      </Alert>
                    )}
                    {status === 'authenticated' &&
                      session?.user.role !== 'PASSENGER' && (
                        <p className="text-sm text-muted-foreground">
                          Hanya akun penumpang yang dapat memesan tiket.
                        </p>
                      )}
                    {layout && (
                      <div
                        className="mx-auto grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 2.5rem))`,
                        }}
                      >
                        {layout.seats.map((seat) => {
                          const taken = occupied.has(seat.number);
                          const active = chosen.includes(seat.number);
                          return (
                            <button
                              key={seat.number}
                              type="button"
                              disabled={taken || session?.user.role !== 'PASSENGER'}
                              aria-label={`Kursi ${seat.number}`}
                              aria-pressed={active}
                              onClick={() => toggleSeat(seat.number)}
                              className={cn(
                                'flex size-10 items-center justify-center rounded-xl border text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40',
                                active
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : taken
                                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                    : 'border-input bg-input/30 hover:border-primary'
                              )}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <FieldGroup className="gap-4">
                      {chosen.map((number) => (
                        <Field key={number}>
                          <FieldLabel htmlFor={`passenger-${number}`}>
                            Nama penumpang kursi {number}
                          </FieldLabel>
                          <Input
                            id={`passenger-${number}`}
                            value={names[number] ?? defaultName}
                            onChange={(e) =>
                              setNames((prev) => ({
                                ...prev,
                                [number]: e.target.value,
                              }))
                            }
                            placeholder="Nama lengkap"
                            required
                          />
                        </Field>
                      ))}
                    </FieldGroup>
                  </CardContent>
                </Card>

                {services.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Layanan tambahan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FieldGroup className="grid gap-4 sm:grid-cols-2">
                        {services.map((service) => (
                          <Field key={service.id}>
                            <FieldLabel htmlFor={`service-${service.id}`}>
                              {service.name} ({formatCurrency(service.price)})
                            </FieldLabel>
                            <Input
                              id={`service-${service.id}`}
                              type="number"
                              min={0}
                              max={service.capacity ?? 99}
                              value={quantities[service.serviceId] ?? 0}
                              onChange={(e) =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [service.serviceId]: Math.max(
                                    0,
                                    Math.min(
                                      service.capacity ?? 99,
                                      Number(e.target.value) || 0
                                    ),
                                  ),
                                }))
                              }
                            />
                            <p className="typo-caption text-muted-foreground">
                              {service.capacity === null
                                ? 'Kuota tidak terbatas'
                                : `Kuota: ${service.capacity}`}
                            </p>
                          </Field>
                        ))}
                      </FieldGroup>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">Ringkasan</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Tiket ({chosen.length})</span>
                    <span>{formatCurrency(trip.price * chosen.length)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Layanan tambahan</span>
                    <span>
                      {formatCurrency(
                        services.reduce(
                          (sum, s) =>
                            sum + s.price * (quantities[s.serviceId] ?? 0),
                          0
                        )
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      !chosen.length ||
                      isCreating ||
                      session?.user.role !== 'PASSENGER'
                    }
                  >
                    {isCreating && <Spinner data-icon="inline-start" />}
                    {isCreating ? 'Membuat pemesanan...' : 'Buat pemesanan'}
                  </Button>
                  <p className="typo-caption text-muted-foreground">
                    Pembayaran harus diselesaikan dalam 15 menit.
                  </p>
                </CardContent>
              </Card>
            </PageSection>
          </form>
        )
      )}
    </Page>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Page className="bg-background" />}>
      <Checkout />
    </Suspense>
  );
}
