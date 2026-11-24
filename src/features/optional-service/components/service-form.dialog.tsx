'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GetServiceResponse } from '@/app/api/services/[id]/route';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { DialogState } from '@/hooks/use-dialog';
import { createServiceAction, updateServiceAction } from '../actions';
import { CreateService, createServiceSchema } from '../schemas';

type ServiceFormDialogPayload = { id?: string };

const EMPTY: CreateService = {
  name: '',
  description: '',
  price: 0,
  capacity: null,
};

function ServiceFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
  onSuccess,
}: DialogState<ServiceFormDialogPayload> & { onSuccess?: () => void }) {
  const id = payload?.id;

  const { item: data, isLoading } = useApi<GetServiceResponse>(
    `/api/services/${id}`,
    {
      enabled: !!id && open,
      onError: (e) => toast.error(e.message),
    }
  );

  const form = useForm<CreateService>({
    resolver: zodResolver(createServiceSchema),
    mode: 'onChange',
    defaultValues: EMPTY,
    values:
      id && data
        ? {
            name: data.name,
            description: data.description,
            price: data.price,
            capacity: data.capacity,
          }
        : undefined,
  });

  const reset = () => form.reset(EMPTY);

  const { run: save, isLoading: isSaving } = useAction(
    (values: CreateService) =>
      id ? updateServiceAction(id, values) : createServiceAction(values),
    {
      successMessage: id
        ? 'Layanan berhasil diperbarui'
        : 'Layanan berhasil dibuat',
      onError: (m) => toast.error(m),
      onSuccess: () => {
        reset();
        hide();
        onSuccess?.();
      },
    }
  );

  const changeOpen = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>{id ? 'Edit Layanan' : 'Buat Layanan'}</DialogTitle>
        </DialogHeader>

        {id && !data && !isLoading ? (
          <NotFoundData data="Layanan" />
        ) : (
          <>
            <form
              id="form-service"
              onSubmit={form.handleSubmit((v) => save(v))}
              className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Makanan"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="price"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Harga</FieldLabel>
                        <Input
                          {...field}
                          value={field.value}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          type="number"
                          min={0}
                          step={1000}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="capacity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Kapasitas</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          type="number"
                          min={1}
                          step={1}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        />
                        <p className="typo-caption text-muted-foreground">
                          Kosongkan untuk tanpa batas.
                        </p>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

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
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-service"
                disabled={!form.formState.isValid || isSaving}
              >
                {isSaving && <Spinner data-icon="inline-start" />}
                Simpan
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { ServiceFormDialog };
export type { ServiceFormDialogPayload };
