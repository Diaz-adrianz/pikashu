import { Container } from '@/components/shared/container';
import {
  RiBankCardLine,
  RiQrCodeLine,
  RiSearchLine,
  RiSofaLine,
} from '@remixicon/react';

const STEPS = [
  {
    icon: RiSearchLine,
    title: 'Cari jadwal',
    description: 'Pilih rute, tanggal, dan jam. Sisa kursi langsung terlihat.',
  },
  {
    icon: RiSofaLine,
    title: 'Pilih kursi dan layanan',
    description:
      'Tentukan kelas kursi, isi nama penumpang, lalu tambah bagasi atau snack bila perlu.',
  },
  {
    icon: RiBankCardLine,
    title: 'Bayar',
    description:
      'Selesaikan pembayaran dalam 15 menit. Kursi Anda ditahan selama itu.',
  },
  {
    icon: RiQrCodeLine,
    title: 'Tunjukkan tiket QR',
    description:
      'Staf memindai tiket Anda saat naik. Prosesnya kurang dari 10 detik.',
  },
];

export const HowItWorksSection = () => {
  return (
    <Container as="section" id="cara-pesan" className="py-24">
      <div className="mb-8 text-center">
        <small className="typo-overline text-primary">Cara pesan</small>
        <h2 className="typo-heading-xl">
          Dari memilih jadwal sampai naik, empat langkah
        </h2>
      </div>

      <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="space-y-3 border-t-2 border-primary pt-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="typo-caption text-muted-foreground">
                  Langkah {i + 1}
                </span>
              </div>
              <step.icon className="size-8 text-primary" />
            </div>
            <h3 className="typo-heading-xs font-semibold">{step.title}</h3>
            <p className="typo-body-md text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </Container>
  );
};
