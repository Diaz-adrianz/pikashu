import { Container } from '@/components/shared/container';
import { Button } from '@/components/ui/button';

export const CtaSection = () => {
  return (
    <Container as="section" className="py-12 md:py-16">
      <div className="flex flex-col gap-6 bg-primary/20 p-8 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-12">
        <div className="max-w-2xl space-y-2">
          <h2 className="typo-heading-xl">
            Perjalanan berikutnya, pesan sekarang
          </h2>
          <p className="typo-body-lg text-primary-foreground">
            Cek kursi yang masih tersedia untuk keberangkatan minggu ini.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" variant="ghost">
            Cari jadwal
          </Button>
          <Button size="lg">Lihat armada</Button>
        </div>
      </div>
    </Container>
  );
};
