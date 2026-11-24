'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = () => {
    if (typeof window === 'undefined') return '/';
    const params = new URLSearchParams(window.location.search);
    const target = params.get('callback') ?? params.get('callbackUrl') ?? '/';
    return target.startsWith('/') && !target.startsWith('//') ? target : '/';
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    });
    if (res?.error) {
      toast.error('Email atau password salah');
      return;
    }

    router.push(callbackUrl());
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Selamat Datang</CardTitle>
        <CardDescription>Masuk dengan akun Google kamu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <Button
                variant="outline"
                type="button"
                onClick={() => signIn('google', { callbackUrl: callbackUrl() })}
              >
                <svg
                  data-icon="inline-start"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Atau lanjutkan dengan
            </FieldSeparator>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>

              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    variant={'ghost'}
                    size={'icon-sm'}
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? (
                      <EyeOffIcon data-icon="inline-start" />
                    ) : (
                      <EyeIcon data-icon="inline-start" />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <Button type="submit">Masuk</Button>
              <FieldDescription className="text-center">
                Belum mempunyai akun? <Link href="/auth/register">Daftar</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
