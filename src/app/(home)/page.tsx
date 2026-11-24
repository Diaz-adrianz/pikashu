'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArmchairIcon,
  ArrowRightIcon,
  BusFrontIcon,
  CalendarDaysIcon,
  CoffeeIcon,
  CreditCardIcon,
  QrCodeIcon,
  RouteIcon,
  WifiIcon,
} from 'lucide-react';
import { Page, PageSection } from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
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

const STEPS = [
  {
    icon: RouteIcon,
    title: 'Cari rute',
    description:
      'Isi kota asal, kota tujuan, tanggal, jumlah kursi, dan kelas kursi.',
  },
  {
    icon: ArmchairIcon,
    title: 'Pilih kursi',
    description:
      'Lihat layout armada, pilih kursi yang tersedia, lalu isi nama penumpang.',
  },
  {
    icon: CreditCardIcon,
    title: 'Selesaikan bayar',
    description:
      'Kursi ditahan 15 menit sejak pemesanan dibuat, sampai pembayaran selesai.',
  },
  {
    icon: QrCodeIcon,
    title: 'Tunjukkan QR',
    description:
      'Tiket elektronik berisi QR. Staf yang bertugas memindainya saat naik.',
  },
];

const HIGHLIGHTS = [
  {
    icon: CalendarDaysIcon,
    title: 'Waktu dan rute terlihat',
    description:
      'Lihat kota asal, kota tujuan, waktu berangkat, dan waktu tiba sebelum memesan.',
  },
  {
    icon: BusFrontIcon,
    title: 'Satu armada, satu kelas',
    description:
      'Setiap perjalanan memakai satu armada dengan satu kelas kursi dan satu harga.',
  },
  {
    icon: WifiIcon,
    title: 'Fasilitas ikut kelas kursi',
    description:
      'Fasilitas yang tampil pada perjalanan mengikuti kelas kursi armada tersebut.',
  },
];

function TicketPreview() {
  return (
    <Card className="w-full max-w-md overflow-hidden shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <span className="typo-overline text-muted-foreground">
              Contoh tiket
            </span>
            <span className="font-heading text-2xl font-bold">
              PKH-XXXXXXXX
            </span>
          </div>
          <Badge variant="secondary">Dibayar</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="grid gap-1">
            <span className="typo-caption text-muted-foreground">Asal</span>
            <span className="typo-heading-md">Jakarta</span>
            <span className="typo-body-sm text-muted-foreground">
              07.00 WIB
            </span>
          </div>
          <Separator />
          <div className="grid gap-1 text-right">
            <span className="typo-caption text-muted-foreground">Tujuan</span>
            <span className="typo-heading-md">Bandung</span>
            <span className="typo-body-sm text-muted-foreground">
              10.00 WIB
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted p-4">
          <div className="grid gap-1">
            <span className="typo-caption text-muted-foreground">Kursi</span>
            <span className="typo-body-sm font-medium">12A</span>
          </div>
          <div className="grid gap-1">
            <span className="typo-caption text-muted-foreground">Kelas</span>
            <span className="typo-body-sm font-medium">Ekonomi</span>
          </div>
          <div className="grid gap-1">
            <span className="typo-caption text-muted-foreground">Kode</span>
            <span className="typo-body-sm font-medium">TKT-XXXXXXXX</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="typo-body-sm text-muted-foreground">
          Satu kursi, satu tiket, satu QR
        </span>
        <span className="flex size-11 items-center justify-center rounded-lg border bg-muted">
          <QrCodeIcon />
        </span>
      </CardFooter>
    </Card>
  );
}

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
      <PageSection
        id="hero"
        className="grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20"
      >
        <div className="grid gap-6">
          <h1 className="max-w-2xl typo-display">
            Pesan bus, pilih kursi, bawa tiket QR.
          </h1>
          <p className="max-w-xl typo-lead">
            Pikashu menampilkan jadwal, harga, kelas kursi, fasilitas, dan kursi
            yang tersedia sebelum kamu memesan. Setelah bayar, tiket elektronik
            dengan QR siap dipakai saat boarding.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#cari-perjalanan">
                Cari perjalanan
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/fasilitas">Lihat fasilitas</Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <TicketPreview />
        </div>
      </PageSection>

      <PageSection id="cari-perjalanan" className="pb-14 lg:pb-20">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Cari perjalanan</CardTitle>
            <CardDescription>
              Isi rute dan tanggal untuk melihat perjalanan yang tersedia.
            </CardDescription>
          </CardHeader>
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

      <PageSection className="pb-14 lg:pb-20">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="grid gap-3">
            <h2 className="typo-heading-lg">
              Rute, waktu, dan kursi tampil lebih awal
            </h2>
            <p className="typo-body-md text-muted-foreground">
              Detail perjalanan membuka rute, waktu, harga, armada, fasilitas,
              peta rute, dan kursi yang masih tersedia.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="typo-body-sm text-muted-foreground">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <PageSection className="pb-14 lg:pb-20">
        <h2 className="typo-heading-lg">Empat langkah sampai QR dipindai</h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon />
                    <Badge variant="outline">
                      {String(index + 1).padStart(2, '0')}
                    </Badge>
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="typo-body-sm text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </PageSection>

      <PageSection className="grid gap-8 rounded-3xl bg-muted p-6 md:p-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="grid gap-4">
          <CoffeeIcon />
          <h2 className="typo-heading-lg">Fasilitas mengikuti kelas kursi</h2>
          <p className="typo-body-md text-muted-foreground">
            Armada ekonomi dan bisnis punya fasilitas berbeda. Layanan tambahan
            bisa dipilih saat checkout, sebelum pembayaran.
          </p>
          <div>
            <Button asChild variant="outline">
              <Link href="/fasilitas">
                Lihat fasilitas
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="typo-heading-sm">Ekonomi</CardTitle>
            </CardHeader>
            <CardContent className="typo-body-sm text-muted-foreground">
              AC dan Wi-Fi untuk perjalanan harian.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="typo-heading-sm">Bisnis</CardTitle>
            </CardHeader>
            <CardContent className="typo-body-sm text-muted-foreground">
              Kursi reclining dan snack untuk perjalanan lebih jauh.
            </CardContent>
          </Card>
          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="typo-heading-sm">
                Layanan tambahan
              </CardTitle>
            </CardHeader>
            <CardContent className="typo-body-sm text-muted-foreground">
              Makanan, air mineral, dan selimut tersedia sesuai kuota tiap
              perjalanan.
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <PageSection className="mt-14 mb-8 flex flex-col items-center gap-4 rounded-3xl bg-primary/20 p-8 text-center text-primary-foreground md:p-12">
        <h2 className="max-w-2xl typo-heading-lg">
          Cari kursi untuk perjalanan berikutnya.
        </h2>
        <p className="max-w-xl typo-body-md text-primary-foreground/80">
          Jadwal, harga, dan kursi tersedia tampil sebelum kamu memesan.
        </p>
        <Button asChild size="lg">
          <Link href="#hero">Cari perjalanan</Link>
        </Button>
      </PageSection>
    </Page>
  );
}
