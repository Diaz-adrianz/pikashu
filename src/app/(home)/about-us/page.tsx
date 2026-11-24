import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArmchairIcon,
  ArrowRightIcon,
  ClipboardCheckIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Page, PageSection } from '@/components/shared/page';

export const metadata: Metadata = {
  title: 'Tentang Kami | Pikashu',
  description:
    'Pikashu menyatukan pencarian perjalanan, pemesanan kursi, pembayaran, dan tiket QR untuk bus dan minibus.',
};

const ROLES = [
  {
    icon: UsersIcon,
    title: 'Penumpang',
    description:
      'Mencari perjalanan, memilih kursi, membayar, mengelola pemesanan, dan membuka tiket QR.',
  },
  {
    icon: ClipboardCheckIcon,
    title: 'Staf',
    description:
      'Melihat perjalanan yang ditugaskan, memeriksa daftar penumpang, dan memindai QR saat boarding.',
  },
  {
    icon: ArmchairIcon,
    title: 'Admin',
    description:
      'Mengelola armada, rute, jadwal, fasilitas, akun, perjalanan, dan refund dari satu tempat.',
  },
];

const FAQ = [
  {
    value: 'cutoff',
    question: 'Kapan pemesanan ditutup?',
    answer:
      'Pemesanan berhenti 2 jam sebelum keberangkatan. Setelah itu, kursi tidak bisa dipesan lagi.',
  },
  {
    value: 'hold',
    question: 'Berapa lama kursi ditahan setelah pemesanan?',
    answer:
      'Kursi dan kuota layanan tambahan ditahan 15 menit sejak pemesanan dibuat, sampai pembayaran selesai.',
  },
  {
    value: 'boarding',
    question: 'Bagaimana cara naik armada?',
    answer:
      'Buka tiket elektronik, lalu tunjukkan QR. Staf yang bertugas memindainya dan status boarding diperbarui setelah pemeriksaan.',
  },
  {
    value: 'price',
    question: 'Apakah harga bisa berubah setelah memesan?',
    answer:
      'Harga tiket dan layanan tambahan mengikuti data pada perjalanan yang kamu pesan. Perubahan katalog tidak mengubah perjalanan yang sudah dibuat.',
  },
  {
    value: 'time',
    question: 'Zona waktu apa yang dipakai?',
    answer: 'Waktu perjalanan dan jadwal ditampilkan dalam WIB.',
  },
];

export default function AboutPage() {
  return (
    <Page className="bg-background">
      <PageSection className="grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="grid gap-5">
          <h1 className="max-w-2xl typo-display">
            Pikashu menyatukan pemesanan bus dan tiket QR
          </h1>
          <p className="max-w-xl typo-lead">
            Kami mengumpulkan pencarian jadwal, pilihan kursi, pembayaran, dan
            tiket elektronik dalam satu alur. Penumpang bisa melihat detail
            perjalanan lebih awal, lalu menyimpan tiket QR untuk boarding.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">
                Cari perjalanan
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <ShieldCheckIcon />
            <CardTitle>Data perjalanan yang jelas</CardTitle>
            <CardDescription>
              Detail perjalanan tampil sebelum penumpang memilih kursi.
            </CardDescription>
          </CardHeader>
          <CardContent className="typo-body-sm text-muted-foreground">
            Rute, waktu, harga, armada, kelas kursi, fasilitas, peta rute, dan
            kursi tersedia menjadi bagian dari halaman perjalanan.
          </CardContent>
        </Card>
      </PageSection>

      <PageSection className="grid gap-6 pb-14 lg:pb-20">
        <div className="grid gap-3">
          <h2 className="typo-heading-lg">Siapa yang memakai Pikashu</h2>
          <p className="typo-body-md text-muted-foreground">
            Setiap peran melihat bagian yang berbeda, sesuai pekerjaannya.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {ROLES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="h-full">
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

      <PageSection className="grid gap-6 rounded-3xl bg-muted p-6 md:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="grid gap-3">
          <h2 className="typo-heading-lg">Pertanyaan yang sering muncul</h2>
          <p className="typo-body-md text-muted-foreground">
            Aturan pemesanan, pembayaran, dan boarding ringkasnya ada di sini.
          </p>
        </div>
        <Accordion type="single" collapsible defaultValue={FAQ[0].value}>
          {FAQ.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="typo-body-sm text-muted-foreground">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </PageSection>

      <PageSection className="mt-14 mb-8 flex flex-col items-center gap-4 rounded-3xl bg-primary/20 p-8 text-center text-primary-foreground md:p-12">
        <h2 className="max-w-2xl typo-heading-lg">
          Mulai dari mencari perjalanan
        </h2>
        <p className="max-w-xl typo-body-md text-primary-foreground/80">
          Rute, jadwal, dan kursi tersedia bisa dilihat sebelum kamu memesan.
        </p>
        <Button asChild size="lg">
          <Link href="/trips">Lihat perjalanan</Link>
        </Button>
      </PageSection>
    </Page>
  );
}
