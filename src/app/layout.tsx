import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConfirmProvider } from '@/components/shared/confirm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SessionProvider } from '@/components/shared/auth';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Pikashu | Shuttle Booking App',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={cn(
        'h-full',
        'antialiased',
        'font-sans',
        inter.variable,
        plusJakartaSans.variable
      )}
    >
      <body className="flex min-h-full flex-col">
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
