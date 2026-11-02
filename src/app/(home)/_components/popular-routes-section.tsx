import { Container } from '@/components/shared/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';
import { RiBusLine, RiTimeLine } from '@remixicon/react';

const ROUTES = [
  {
    from: 'Bandung',
    to: 'Jakarta',
    duration: '3 jam',
    departures: 8,
    price: 'Rp95.000',
  },
  {
    from: 'Jakarta',
    to: 'Bandung',
    duration: '3 jam',
    departures: 8,
    price: 'Rp95.000',
  },
  {
    from: 'Bandung',
    to: 'Bandara Soekarno-Hatta',
    duration: '3,5 jam',
    departures: 6,
    price: 'Rp125.000',
  },
  {
    from: 'Bandung',
    to: 'Yogyakarta',
    duration: '8 jam',
    departures: 3,
    price: 'Rp185.000',
  },
  {
    from: 'Jakarta',
    to: 'Semarang',
    duration: '7 jam',
    departures: 4,
    price: 'Rp165.000',
  },
];

export const PopularRoutesSection = () => {
  return (
    <Container as="section" className="py-24">
      <div className="mb-8 text-center">
        <small className="typo-overline text-primary">Rute Populer</small>
        <h2 className="typo-heading-xl">Rute yang Paling Sering Dipesan</h2>
      </div>

      <Card>
        <CardContent>
          <ItemGroup>
            {ROUTES.map((r) => (
              <Item key={`${r.from}-${r.to}`}>
                <ItemContent>
                  <ItemTitle className="text-lg">
                    {r.from} - {r.to}
                  </ItemTitle>
                  <ItemDescription className="flex items-center">
                    <RiTimeLine className="me-2 size-4" />
                    {r.duration}
                    <RiBusLine className="ms-4 me-2 size-4" />
                    {r.departures} keberangkatan per hari
                  </ItemDescription>
                </ItemContent>
                <ItemContent>
                  <ItemDescription>
                    Mulai dari
                    <span className="ms-2 text-base font-semibold text-foreground">
                      {r.price}
                    </span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="outline" size="sm">
                    Lihat jadwal
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>
    </Container>
  );
};
