'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { GetProfileResponse } from '@/app/api/profile/route';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import {
  changePasswordAction,
  updateProfileAction,
} from '@/features/user/profile-actions';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [passwordKey, setPasswordKey] = useState(0);
  const enabled = status === 'authenticated';
  const {
    item: profile,
    isLoading,
    refresh,
  } = useApi<GetProfileResponse>('/api/profile', { enabled });

  const { run: saveProfile, isLoading: isSaving } = useAction(
    updateProfileAction,
    {
      successMessage: 'Profil diperbarui',
      onSuccess: () => {
        void refresh();
        router.refresh();
      },
    }
  );
  const { run: savePassword, isLoading: isChanging } = useAction(
    changePasswordAction,
    {
      successMessage: 'Password diperbarui',
      onSuccess: () => setPasswordKey((key) => key + 1),
    }
  );

  const onProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveProfile({
      name: String(fd.get('name') ?? ''),
      phone: String(fd.get('phone') ?? '') || null,
    });
  };

  const onPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    savePassword({
      currentPassword: String(fd.get('currentPassword') ?? ''),
      newPassword: String(fd.get('newPassword') ?? ''),
      confirmPassword: String(fd.get('confirmPassword') ?? ''),
    });
  };

  return (
    <Page>
      <PageNav items={[{ label: 'Beranda', href: '/' }, { label: 'Profil' }]} />
      <PageHeader
        title="Profil Saya"
        description="Perbarui data diri dan kata sandi akun Anda."
      />

      {status === 'unauthenticated' && (
        <PageSection>
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-2">
              <p>Masuk untuk mengelola profil Anda.</p>
              <Button asChild>
                <Link
                  href={`/auth/login?callbackUrl=${encodeURIComponent('/profile')}`}
                >
                  Masuk
                </Link>
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      )}

      {enabled && (
        <PageSection className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <Card className="h-fit">
            <CardHeader className="items-center text-center">
              <Avatar className="mx-auto size-20">
                <AvatarImage
                  src={profile?.image ?? session?.user.image ?? ''}
                />
                <AvatarFallback>
                  {getInitials(profile?.name ?? session?.user.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">
                {profile?.name ?? session?.user.name}
              </CardTitle>
              <p className="typo-caption text-muted-foreground">
                {profile?.email ?? session?.user.email}
              </p>
            </CardHeader>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data diri</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && !profile ? (
                  <p className="text-sm text-muted-foreground">
                    Memuat profil...
                  </p>
                ) : (
                  <form
                    key={profile?.id ?? 'profile'}
                    onSubmit={onProfileSubmit}
                  >
                    <FieldGroup>
                      <Field>
                        <FieldLabel htmlFor="name">Nama lengkap</FieldLabel>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={profile?.name ?? ''}
                          minLength={3}
                          required
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field data-disabled>
                          <FieldLabel htmlFor="email">Email</FieldLabel>
                          <Input
                            id="email"
                            value={profile?.email ?? ''}
                            disabled
                            readOnly
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="phone">Nomor telepon</FieldLabel>
                          <Input
                            id="phone"
                            name="phone"
                            defaultValue={profile?.phone ?? ''}
                            maxLength={20}
                            placeholder="08xxxxxxxxxx"
                          />
                        </Field>
                      </div>
                      <Button type="submit" disabled={isSaving || !profile}>
                        {isSaving && <Spinner data-icon="inline-start" />}
                        {isSaving ? 'Menyimpan...' : 'Simpan profil'}
                      </Button>
                    </FieldGroup>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ubah password</CardTitle>
              </CardHeader>
              <CardContent>
                <form key={passwordKey} onSubmit={onPasswordSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="currentPassword">
                        Password saat ini
                      </FieldLabel>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="newPassword">
                          Password baru
                        </FieldLabel>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          minLength={8}
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="confirmPassword">
                          Konfirmasi password
                        </FieldLabel>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          minLength={8}
                          required
                        />
                      </Field>
                    </div>
                    <Button type="submit" disabled={isChanging}>
                      {isChanging && <Spinner data-icon="inline-start" />}
                      {isChanging ? 'Mengubah...' : 'Ubah password'}
                    </Button>
                    <p className="typo-caption text-muted-foreground">
                      Akun Google tidak dapat mengubah password di sini.
                    </p>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </PageSection>
      )}
    </Page>
  );
}
