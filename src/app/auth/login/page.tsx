'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { RiGoogleFill, RiLoader2Line } from '@remixicon/react';
import { Alert, AlertTitle } from '@/components/ui/alert';

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: 'Email ini terdaftar dengan metode masuk lain.',
  AccessDenied: 'Akses ditolak. Hubungi dukungan jika ini keliru.',
  Configuration: 'Fitur masuk sedang tidak tersedia. Coba lagi nanti.',
};

export default function Page() {
  const params = useSearchParams();
  const [pending, setPending] = useState(false);

  const callback = params.get('callback') ?? '/';

  const code = params.get('error');
  const error = code
    ? (ERRORS[code] ?? 'Terjadi kesalahan. Silakan coba lagi.')
    : null;

  const onGoogle = async () => {
    setPending(true);
    try {
      await signIn('google', { callbackUrl: callback });
    } catch {
      setPending(false);
    }
  };

  return (
    <div className="flex max-w-xs flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h3>Selamat Datang</h3>
          <FieldDescription className="text-center">
            Masuk dengan Google untuk melanjutkan ke Pikashu
          </FieldDescription>
        </div>

        <Field className="gap-3">
          {error && (
            <Alert variant={'destructive'}>
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={pending}
            onClick={onGoogle}
          >
            {pending ? (
              <RiLoader2Line className="animate-spin" aria-hidden="true" />
            ) : (
              <RiGoogleFill />
            )}
            {pending ? 'Redirecting…' : 'Lanjutkan dengan Google'}
          </Button>
        </Field>
      </FieldGroup>

      <FieldDescription className="px-6 text-center">
        Dengan melanjutkan, Kamu menyetujui{' '}
        <Link href="/terms">Ketentuan Layanan</Link> dan{' '}
        <Link href="/privacy">Kebijakan Privasi</Link> kami.
      </FieldDescription>
    </div>
  );
}
