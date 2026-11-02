import type { Metadata } from 'next';
import '../assets/styles/globals.css';
import { cn } from 'cn';
import { SessionProvider } from '@/lib/next-auth/components/session-provider';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/next-auth/config';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmProvider } from '@/components/shared/confirm';
import {
  Inter,
  Plus_Jakarta_Sans,
  Source_Serif_4,
  JetBrains_Mono,
} from 'next/font/google';

export const inter = Inter({
  subsets: [
    'latin',
    'latin-ext',
    'cyrillic',
    'cyrillic-ext',
    'greek',
    'vietnamese',
  ],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic-ext', 'vietnamese'],
  weight: ['600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const sourceSerif4 = Source_Serif_4({
  subsets: [
    'latin',
    'latin-ext',
    'cyrillic',
    'cyrillic-ext',
    'greek',
    'vietnamese',
  ],
  weight: ['400', '600'],
  variable: '--font-source-serif-4',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: [
    'latin',
    'latin-ext',
    'cyrillic',
    'cyrillic-ext',
    'greek',
    'vietnamese',
  ],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pikashu | Shuttle Booking App',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const session = await getServerSession(authConfig);

  return (
    <html
      lang="en"
      className={cn(
        'scroll-smooth antialiased',
        inter.variable,
        plusJakartaSans.variable,
        sourceSerif4.variable,
        jetbrainsMono.variable
      )}
    >
      <body>
        <SessionProvider session={session}>
          <TooltipProvider>
            <ConfirmProvider>{children}</ConfirmProvider>
          </TooltipProvider>
          <Toaster position="top-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
