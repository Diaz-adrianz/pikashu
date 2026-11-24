import { BusFrontIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const MAIN_LINKS = [
  { href: '/', label: 'Cari perjalanan' },
  { href: '/trips', label: 'Perjalanan' },
  { href: '/fasilitas', label: 'Fasilitas' },
  { href: '/tentang-kami', label: 'Tentang Kami' },
];

const ACCOUNT_LINKS = [
  { href: '/auth/login', label: 'Masuk' },
  { href: '/bookings', label: 'Pemesanan' },
  { href: '/profile', label: 'Profil' },
];

export function MarketingFooter() {
  return (
    <footer className="w-full bg-primary/20 text-primary-foreground">
      <div className="container mx-auto flex flex-col gap-10 px-4 py-12 md:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <BusFrontIcon />
            <span className="font-heading text-2xl font-bold">Pikashu</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
            Pemesanan bus dan minibus dengan pilihan kursi, fasilitas yang
            jelas, dan tiket QR untuk boarding.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <nav
            className="flex flex-col items-start gap-2"
            aria-label="Jelajahi"
          >
            <span className="text-sm font-semibold">Jelajahi</span>
            {MAIN_LINKS.map((link) => (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
          <nav className="flex flex-col items-start gap-2" aria-label="Akun">
            <span className="text-sm font-semibold">Akun</span>
            {ACCOUNT_LINKS.map((link) => (
              <Button key={link.href} variant="ghost" size="sm" asChild>
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
      <Separator className="bg-primary-foreground/20" />
      <div className="container mx-auto px-4 py-5 text-xs text-primary-foreground/70 md:px-6 lg:px-8">
        Waktu perjalanan ditampilkan dalam WIB.
      </div>
    </footer>
  );
}
