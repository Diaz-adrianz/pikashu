'use client';

import { Container } from '@/components/shared/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from 'cn';
import { DialogState, useDialogState } from '@/hooks/use-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RiCalendarLine,
  RiGroup3Line,
  RiMapPinLine,
  RiSearchLine,
} from '@remixicon/react';

const CITIES = [
  { value: 'bandung', label: 'Bandung' },
  { value: 'jakarta', label: 'Jakarta' },
  { value: 'soekarno-hatta', label: 'Bandara Soekarno-Hatta' },
  { value: 'yogyakarta', label: 'Yogyakarta' },
  { value: 'semarang', label: 'Semarang' },
];

const PASSENGER_OPTIONS = [1, 2, 3, 4, 5];

type SeatStatus = 'free' | 'taken' | 'selected';

const SEAT_ROWS: { id: string; status: SeatStatus }[][] = [
  [
    { id: '1A', status: 'taken' },
    { id: '1B', status: 'taken' },
    { id: '1C', status: 'free' },
    { id: '1D', status: 'free' },
  ],
  [
    { id: '2A', status: 'free' },
    { id: '2B', status: 'selected' },
    { id: '2C', status: 'selected' },
    { id: '2D', status: 'taken' },
  ],
  [
    { id: '3A', status: 'free' },
    { id: '3B', status: 'free' },
    { id: '3C', status: 'free' },
    { id: '3D', status: 'taken' },
  ],
];

const SEAT_STYLES: Record<SeatStatus, string> = {
  free: 'border bg-background',
  taken: 'bg-muted text-muted-foreground/60',
  selected: 'bg-primary text-primary-foreground',
};

const PreviewDialog = ({ open, onOpenChange }: DialogState) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jadwal</DialogTitle>
        </DialogHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Sabtu, 14 November 2026
            </p>
            <p className="mt-1 text-xl font-semibold">Bandung – Jakarta</p>
          </div>
          <p className="text-right text-sm text-muted-foreground">
            Hiace Commuter
            <br />
            Premium
          </p>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <div>
            <p className="text-2xl font-semibold tabular-nums">07.00</p>
            <p className="text-xs text-muted-foreground">Pasteur</p>
          </div>
          <div className="h-px border-t border-dashed" />
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">10.00</p>
            <p className="text-xs text-muted-foreground">Blok M</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <div className="space-y-2">
            {SEAT_ROWS.map((row, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                {row.map((seat, j) => (
                  <div key={seat.id} className="flex items-center gap-2">
                    {j === 2 && <span className="w-6" />}
                    <span
                      className={cn(
                        'flex size-9 items-center justify-center rounded-md text-xs font-medium',
                        SEAT_STYLES[seat.status]
                      )}
                    >
                      {seat.id}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm border bg-background" />{' '}
              Tersedia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-primary" /> Dipilih
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-sm bg-muted" /> Terisi
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">2 kursi Premium</p>
          <p className="text-lg font-semibold">Rp300.000</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const HeroSection = () => {
  const previewDialog = useDialogState();

  return (
    <Container as="section" className="py-24">
      <PreviewDialog {...previewDialog} />

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="max-w-2xl typo-display">Naik shuttle tanpa repot</h1>
        <p className="mb-4 max-w-xl typo-body-md text-muted-foreground">
          Lihat jadwal, pilih kursi favorit, bayar online. Tunjukkan QR, lalu
          naik.
        </p>

        <Card className="w-full max-w-4xl">
          <CardContent>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="origin" className="gap-1.5">
                  <RiMapPinLine className="size-4 text-muted-foreground" />
                  Asal
                </Label>
                <Select defaultValue="bandung">
                  <SelectTrigger id="origin" className="w-full">
                    <SelectValue placeholder="Pilih kota asal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="gap-1.5">
                  <RiMapPinLine className="size-4 text-muted-foreground" />
                  Tujuan
                </Label>
                <Select defaultValue="jakarta">
                  <SelectTrigger id="destination" className="w-full">
                    <SelectValue placeholder="Pilih kota tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="gap-1.5">
                  <RiCalendarLine className="size-4 text-muted-foreground" />
                  Tanggal berangkat
                </Label>
                <Input id="date" type="date" defaultValue="2026-11-14" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengers" className="gap-1.5">
                  <RiGroup3Line className="size-4 text-muted-foreground" />
                  Jumlah kursi
                </Label>
                <Select defaultValue="2">
                  <SelectTrigger id="passengers" className="w-full">
                    <SelectValue placeholder="Pilih jumlah" />
                  </SelectTrigger>
                  <SelectContent>
                    {PASSENGER_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} kursi
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                size="lg"
                className="sm:col-span-2"
                onClick={() => previewDialog.show(undefined)}
              >
                <RiSearchLine />
                Cari jadwal
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Maksimal 5 kursi per pesanan. Pembayaran lewat VA, e-wallet, atau
          kartu.
        </p>
      </div>
    </Container>
  );
};
