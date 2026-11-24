'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import type { GeoJsonObject } from 'geojson';
import type { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GetTripResponse } from '@/app/api/trips/[id]/route';
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
import {
  SeatTierOptionsMap,
  FleetTypeOptionsMap,
} from '@/constants/options';
import { getSeatLayout } from '@/features/trip/seat-layout';
import { useApi } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
  ssr: false,
});
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), {
  ssr: false,
});
const GeoJSON = dynamic(() => import('react-leaflet').then((m) => m.GeoJSON), {
  ssr: false,
});

type Route = NonNullable<GetTripResponse['data']>['route'];

function RouteMap({ route }: { route: Route }) {
  const [icon, setIcon] = useState<DivIcon | null>(null);

  // ponytail: divIcon avoids missing Leaflet marker assets; no custom icon files.
  useEffect(() => {
    let active = true;
    import('leaflet').then(({ divIcon }) => {
      if (active)
        setIcon(
          divIcon({
            className: '',
            html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#eab308;border:2px solid white;box-shadow:0 1px 4px #0006"></span>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          })
        );
    });
    return () => {
      active = false;
    };
  }, []);

  const rawPath = route.path as unknown;
  const coordinates: [number, number][] = Array.isArray(rawPath)
    ? rawPath
        .map((point) => {
          if (!Array.isArray(point) || point.length < 2) return null;
          const lat = Number(point[0]);
          const lng = Number(point[1]);
          return Number.isFinite(lat) && Number.isFinite(lng)
            ? ([lat, lng] as [number, number])
            : null;
        })
        .filter((point): point is [number, number] => point !== null)
    : [];
  const hasGeoJson =
    !!rawPath &&
    typeof rawPath === 'object' &&
    !Array.isArray(rawPath) &&
    'type' in rawPath;
  const direct: [number, number][] = [
    [route.originLat, route.originLng],
    [route.destinationLat, route.destinationLng],
  ];

  if (!icon)
    return <div className="h-80 w-full animate-pulse rounded-2xl bg-muted" />;

  return (
    <MapContainer
      center={direct[0]}
      zoom={8}
      scrollWheelZoom={false}
      className="h-80 w-full rounded-2xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={direct[0]} icon={icon} />
      <Marker position={direct[1]} icon={icon} />
      {coordinates.length > 1 && (
        <Polyline positions={coordinates} pathOptions={{ color: '#eab308' }} />
      )}
      {hasGeoJson && (
        <GeoJSON
          data={rawPath as GeoJsonObject}
          style={() => ({ color: '#eab308' })}
        />
      )}
      {!hasGeoJson && coordinates.length < 2 && (
        <Polyline positions={direct} pathOptions={{ color: '#eab308' }} />
      )}
    </MapContainer>
  );
}

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { item: trip, isLoading } = useApi<GetTripResponse>(`/api/trips/${id}`);
  const [selected, setSelected] = useState<string[]>([]);

  const canBook = status === 'authenticated' && session?.user.role === 'PASSENGER';
  const layout = trip ? getSeatLayout(trip.fleet.type) : null;
  const occupied = new Set(trip?.occupiedSeats ?? []);
  const facilities = Array.isArray(trip?.facilities)
    ? (trip.facilities as unknown as {
        title: string;
        description: string;
        image: string;
      }[])
    : [];

  const toggleSeat = (number: string) =>
    setSelected((prev) =>
      prev.includes(number)
        ? prev.filter((s) => s !== number)
        : [...prev, number].sort((a, b) => Number(a) - Number(b))
    );

  return (
    <Page>
      <PageNav
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Perjalanan', href: '/trips' },
          { label: 'Detail' },
        ]}
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
          <>
            <PageHeader
              title={trip.route.name}
              description={`${trip.route.originCity} → ${trip.route.destinationCity}`}
              action={<Badge>{SeatTierOptionsMap[trip.seatTier].label}</Badge>}
            />
            <PageSection className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <Card>
                {trip.fleet.images[0] && (
                  <div className="relative h-56 w-full bg-muted">
                    <Image
                      src={`/api/uploads/${trip.fleet.images[0].path}`}
                      alt={trip.fleet.name}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{trip.fleet.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
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
                  <p>
                    <span className="text-muted-foreground">Tipe armada</span>
                    <br />
                    {FleetTypeOptionsMap[trip.fleet.type].label}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Kursi tersedia</span>
                    <br />
                    {trip.capacity - occupied.size} dari {trip.capacity}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rute perjalanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <RouteMap route={trip.route} />
                </CardContent>
              </Card>
            </PageSection>

            {facilities.length > 0 && (
              <PageSection>
                <h2 className="typo-heading-md">Fasilitas</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {facilities.map((facility, i) => (
                    <Card key={`${facility.title}-${i}`}>
                      <div className="relative h-32 w-full bg-muted">
                        <Image
                          src={`/api/uploads/${facility.image}`}
                          alt={facility.title}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{facility.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-muted-foreground">
                        {facility.description}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </PageSection>
            )}

            <PageSection>
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg">Pilih kursi</CardTitle>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(trip.price)} / kursi
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {status === 'unauthenticated' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted p-4">
                      <p className="text-sm">
                        Masuk sebagai penumpang untuk memilih kursi.
                      </p>
                      <Button size="sm" asChild>
                        <Link
                          href={`/auth/login?callbackUrl=${encodeURIComponent(`/trips/${id}`)}`}
                        >
                          Masuk
                        </Link>
                      </Button>
                    </div>
                  )}
                  {status === 'authenticated' && !canBook && (
                    <p className="text-sm text-muted-foreground">
                      Hanya akun penumpang yang dapat memesan tiket.
                    </p>
                  )}
                  {layout && (
                    <div className="flex flex-col items-center gap-3">
                      <p className="w-full text-center typo-caption text-muted-foreground">
                        Depan bus
                      </p>
                      <div
                        className="grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 2.5rem))`,
                        }}
                      >
                        {layout.seats.map((seat) => {
                          const taken = occupied.has(seat.number);
                          const active = selected.includes(seat.number);
                          return (
                            <button
                              key={seat.number}
                              type="button"
                              disabled={taken || !canBook}
                              aria-label={`Kursi ${seat.number}`}
                              aria-pressed={active}
                              onClick={() => toggleSeat(seat.number)}
                              className={`flex size-10 items-center justify-center rounded-xl border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                active
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : taken
                                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                    : 'border-input bg-input/30 hover:border-primary'
                              }`}
                            >
                              {seat.number}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-4 typo-caption text-muted-foreground">
                        <span>Tersedia</span>
                        <span className="text-destructive">Terisi</span>
                        <span className="text-primary">Dipilih</span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm">
                      {selected.length
                        ? `${selected.length} kursi dipilih: ${selected.join(', ')}`
                        : 'Belum ada kursi dipilih'}
                    </p>
                    <Button
                      disabled={!selected.length || !canBook}
                      onClick={() =>
                        router.push(
                          `/trips/${id}/checkout?seats=${selected.join(',')}`
                        )
                      }
                    >
                      Lanjut ke pemesanan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          </>
        )
      )}
    </Page>
  );
}
