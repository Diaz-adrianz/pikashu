import { Container } from '@/components/shared/container';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import {
  RiBankCardLine,
  RiBellLine,
  RiMapPinLine,
  RiQrCodeLine,
  RiSofaLine,
  RiTimeLine,
} from '@remixicon/react';

const FEATURES = [
  {
    icon: RiSofaLine,
    title: 'Pilih kursi sendiri',
    description:
      'Lihat denah kursi shuttle secara langsung. Pilih posisi favorit sebelum membayar.',
  },
  {
    icon: RiTimeLine,
    title: 'Jadwal selalu terbaru',
    description:
      'Keberangkatan tampil real-time. Tidak perlu menelepon untuk cek jam tersedia.',
  },
  {
    icon: RiMapPinLine,
    title: 'Titik jemput fleksibel',
    description:
      'Pilih lokasi jemput dan antar dari daftar pool resmi. Tarif otomatis menyesuaikan rute.',
  },
  {
    icon: RiBankCardLine,
    title: 'Bayar tanpa ribet',
    description:
      'Virtual account, e-wallet, atau kartu lewat Midtrans. Data kartu tidak disimpan di Pikashu.',
  },
  {
    icon: RiQrCodeLine,
    title: 'E-tiket langsung terbit',
    description:
      'QR muncul setelah pembayaran berhasil. Tunjukkan ke sopir saat naik.',
  },
  {
    icon: RiBellLine,
    title: 'Pengingat otomatis',
    description:
      'Notifikasi dikirim sebelum jam jemput. Perubahan jadwal juga langsung diberitahukan.',
  },
];

export const FeaturesSection = () => {
  return (
    <Container as="section" id="keunggulan" className="py-24">
      <div className="mb-8 text-center">
        <small className="typo-overline text-primary">Keunggulan</small>
        <h2 className="typo-heading-xl">Kemudahan yang Anda dapatkan</h2>
      </div>

      <ItemGroup className="grid md:grid-cols-2">
        {FEATURES.map((f) => (
          <Item key={f.title} variant={'card'} className="items-start">
            <ItemMedia>
              <div className="flex size-8 shrink-0 items-center justify-center bg-primary">
                <f.icon className="size-5" />
              </div>
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="text-base">{f.title}</ItemTitle>
              <ItemDescription>{f.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </Container>
  );
};
