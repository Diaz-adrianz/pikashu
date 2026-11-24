'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GetFacilityResponse } from '@/app/api/facilities/[id]/route';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { DialogState } from '@/hooks/use-dialog';
import { createFacilityAction, updateFacilityAction } from '../actions';
import {
  CreateFacility,
  createFacilitySchema,
  SeatTierOptions,
} from '../schemas';

type FacilityFormDialogPayload = { id?: string };

const EMPTY: CreateFacility = {
  seatTier: 'ECONOMY',
  title: '',
  description: '',
};

function FacilityFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
  onSuccess,
}: DialogState<FacilityFormDialogPayload> & { onSuccess?: () => void }) {
  const id = payload?.id,
    inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);

  const { item: data, isLoading } = useApi<GetFacilityResponse>(
    `/api/facilities/${id}`,
    {
      enabled: !!id && open,
      onError: (e) => toast.error(e.message),
    }
  );

  const form = useForm<CreateFacility>({
    resolver: zodResolver(createFacilitySchema),
    mode: 'onChange',
    defaultValues: EMPTY,
    values:
      id && data
        ? {
            seatTier: data.seatTier,
            title: data.title,
            description: data.description,
          }
        : undefined,
  });

  const reset = () => {
    form.reset(EMPTY);
    setImage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const { run: save, isLoading: isSaving } = useAction(
    (formData: FormData) =>
      id ? updateFacilityAction(id, formData) : createFacilityAction(formData),
    {
      successMessage: id
        ? 'Fasilitas berhasil diperbarui'
        : 'Fasilitas berhasil dibuat',
      onError: (m) => toast.error(m),
      onSuccess: () => {
        reset();
        hide();
        onSuccess?.();
      },
    }
  );

  const onSubmit = (values: CreateFacility) => {
    if (!id && !image) return;
    const formData = new FormData();
    formData.set('seatTier', values.seatTier);
    formData.set('title', values.title);
    formData.set('description', values.description ?? '');
    if (image) formData.set('image', image);
    save(formData);
  };

  const changeOpen = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>{id ? 'Edit Fasilitas' : 'Buat Fasilitas'}</DialogTitle>
        </DialogHeader>

        {id && !data && !isLoading ? (
          <NotFoundData data="Fasilitas" />
        ) : (
          <>
            <form
              id="form-facility"
              onSubmit={form.handleSubmit(onSubmit)}
              className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <Controller
                  name="seatTier"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Kelas kursi</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {SeatTierOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Judul</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Reclining seat"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Deskripsi</FieldLabel>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        rows={3}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="image">Gambar</FieldLabel>
                  <Input
                    ref={inputRef}
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                  />
                  <p className="typo-caption text-muted-foreground">
                    JPEG, PNG, atau WebP. Maksimal 5 MB. Kosongkan untuk
                    mempertahankan gambar lama.
                  </p>
                </Field>

                {id && data && (
                  <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={`/api/uploads/${data.image}`}
                      alt=""
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 480px"
                      className="object-contain"
                    />
                  </div>
                )}
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-facility"
                disabled={
                  !form.formState.isValid || isSaving || (!id && !image)
                }
              >
                Simpan
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { FacilityFormDialog };
export type { FacilityFormDialogPayload };
