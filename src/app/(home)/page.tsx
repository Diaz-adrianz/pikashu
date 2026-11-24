'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Page, PageSection } from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { SeatTierOptions } from '@/constants/options';

type SearchForm = {
  originCity: string;
  destinationCity: string;
  departureDate: string;
  seats: string;
  seatTier: string;
};

const EMPTY: SearchForm = {
  originCity: '',
  destinationCity: '',
  departureDate: '',
  seats: '1',
  seatTier: '',
};

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState<SearchForm>(EMPTY);
  const set = (key: keyof SearchForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = new URLSearchParams();
    (Object.keys(form) as (keyof SearchForm)[]).forEach((key) => {
      if (form[key]) query.set(key, form[key]);
    });
    router.push(`/trips?${query.toString()}`);
  };

  return (
    <Page className="bg-background">
      <PageSection id="hero" className="py-16 md:py-24">
        <h1 className="text-center typo-display">
          Pesan armada bersama Pikashu <br /> untuk perjalanan yang{' '}
          <TypingAnimation
            className="leading-tight text-primary"
            words={[
              'Cepat',
              'Hemat',
              'Nyaman',
              'Aman',
              'Tepat Waktu',
              'Bebas Ribet',
            ]}
            loop
          />
        </h1>

        <Card className="mx-auto mt-10 w-full max-w-6xl shadow-xl">
          <CardContent>
            <form onSubmit={onSubmit}>
              <FieldGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_0.6fr_0.8fr_auto]">
                <Field>
                  <FieldLabel htmlFor="originCity">Kota asal</FieldLabel>
                  <Input
                    id="originCity"
                    placeholder="Contoh: Jakarta"
                    value={form.originCity}
                    onChange={(e) => set('originCity', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="destinationCity">Kota tujuan</FieldLabel>
                  <Input
                    id="destinationCity"
                    placeholder="Contoh: Bandung"
                    value={form.destinationCity}
                    onChange={(e) => set('destinationCity', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="departureDate">
                    Tanggal berangkat
                  </FieldLabel>
                  <Input
                    id="departureDate"
                    type="date"
                    value={form.departureDate}
                    onChange={(e) => set('departureDate', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seats">Jumlah kursi</FieldLabel>
                  <Input
                    id="seats"
                    type="number"
                    min={1}
                    max={40}
                    value={form.seats}
                    onChange={(e) => set('seats', e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="seatTier">Kelas kursi</FieldLabel>
                  <Select
                    value={form.seatTier}
                    onValueChange={(value) => set('seatTier', value)}
                  >
                    <SelectTrigger id="seatTier" className="w-full">
                      <SelectValue placeholder="Semua kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SeatTierOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="justify-end">
                  <Button type="submit" className="lg:self-end">
                    Cari perjalanan
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </PageSection>
    </Page>
  );
}
