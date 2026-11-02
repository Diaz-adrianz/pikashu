import { Container } from '@/components/shared/container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FAQS = [
  {
    question: 'Apakah saya perlu membuat akun untuk memesan?',
    answer:
      'Ya. Daftar dengan email atau nomor HP dan password. Akun dipakai untuk menyimpan tiket dan riwayat perjalanan.',
  },
  {
    question: 'Berapa lama kursi saya ditahan?',
    answer:
      'Kursi ditahan 15 menit sejak Anda menekan Bayar. Jika pembayaran belum selesai, kursi dilepas dan pesanan kedaluwarsa.',
  },
  {
    question: 'Berapa kursi yang bisa saya pesan sekaligus?',
    answer:
      'Maksimal 5 kursi per pesanan. Setiap kursi mendapat satu tiket QR atas nama penumpang masing-masing.',
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer:
      'Virtual account bank, e-wallet, dan kartu kredit atau debit. Semuanya diproses oleh Midtrans.',
  },
  {
    question: 'Bagaimana jika saya perlu membatalkan pesanan?',
    answer:
      'Pembatalan dan refund diproses manual oleh admin. Hubungi admin dengan menyebutkan kode pesanan Anda.',
  },
  {
    question: 'Sampai kapan saya bisa memesan untuk satu keberangkatan?',
    answer: 'Pemesanan ditutup 2 jam sebelum keberangkatan.',
  },
];

export const FaqSection = () => {
  return (
    <Container as="section" className="py-24">
      <div className="mb-8 text-center">
        <small className="typo-overline text-primary">faq</small>
        <h2 className="mb-2 typo-heading-xl">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mb-4 typo-body-md text-muted-foreground">
          Belum menemukan jawabannya? Tanyakan langsung ke admin.
        </p>
        <Button variant="outline">Hubungi admin</Button>
      </div>

      <Card>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="item-0">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.question} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </Container>
  );
};
