import { Container } from '@/components/shared/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  RemixiconComponentType,
  RiBusLine,
  RiLuggageCartLine,
  RiPlugLine,
  RiSnowflakeLine,
  RiWifiLine,
} from '@remixicon/react';

type Facility = { icon: RemixiconComponentType; label: string };

const AC: Facility = { icon: RiSnowflakeLine, label: 'AC' };
const USB: Facility = { icon: RiPlugLine, label: 'Colokan USB' };
const WIFI: Facility = { icon: RiWifiLine, label: 'Wi-Fi' };
const BAGGAGE: Facility = { icon: RiLuggageCartLine, label: 'Bagasi' };

const FLEETS = [
  {
    name: 'Hiace Commuter',
    type: 'Minibus',
    tier: 'Premium',
    seats: 12,
    price: 'Rp150.000',
    facilities: [AC, USB, BAGGAGE],
  },
  {
    name: 'Elf Long',
    type: 'Minibus',
    tier: 'Ekonomi',
    seats: 15,
    price: 'Rp95.000',
    facilities: [AC, BAGGAGE],
  },
  {
    name: 'Medium Bus Executive',
    type: 'Bus',
    tier: 'Premium',
    seats: 32,
    price: 'Rp175.000',
    facilities: [AC, USB, WIFI, BAGGAGE],
  },
];

export const FleetSection = () => {
  return (
    <Container as="section" id="armada" className="py-24">
      <div className="mb-8 text-center">
        <small className="typo-overline text-primary">Armada</small>
        <h2 className="mb-2 typo-heading-xl">Armada yang akan Anda naiki</h2>
        <p className="mb-4 typo-body-md text-muted-foreground">
          Lihat jenis kendaraan, fasilitas, dan foto sebelum memesan.
        </p>
        <Button variant="outline">Lihat semua</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FLEETS.map((f) => (
          <Card key={f.name} className="overflow-hidden pt-0">
            <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
              <RiBusLine className="size-12" />
            </div>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{f.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {f.type}, {f.seats} kursi
                  </p>
                </div>
                <Badge variant={f.tier === 'Premium' ? 'default' : 'secondary'}>
                  {f.tier}
                </Badge>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {f.facilities.map((fac) => (
                  <li key={fac.label} className="flex items-center gap-1.5">
                    <fac.icon className="size-4" />
                    {fac.label}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Mulai dari</span>
              <span className="font-semibold">{f.price}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </Container>
  );
};
