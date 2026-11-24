'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { GetFleetResponse } from '@/app/api/fleets/[id]/route';
import { CreateFleet, createFleetSchema } from '../schemas';
import { createFleetAction, updateFleetAction } from '../actions';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { DialogState } from '@/hooks/use-dialog';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FleetTypeOptions, SeatTierOptions } from '@/constants/options';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';

type FleetFormDialogPayload = { id?: string };

const EMPTY: CreateFleet = {
  name: '',
  description: '',
  type: 'BUS',
  seatTier: 'ECONOMY',
  price: 0,
};

function FleetFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
  onSuccess,
}: DialogState<FleetFormDialogPayload> & { onSuccess?: () => void }) {
  const id = payload?.id;

  const { item: data, isLoading } = useApi<GetFleetResponse>(`/api/fleets/${id}`, {
    enabled: !!id && open,
    onError: (e) => toast.error(e.message),
  });

  const form = useForm<CreateFleet>({
    resolver: zodResolver(createFleetSchema),
    mode: 'onChange',
    defaultValues: EMPTY,
    values:
      id && data
        ? {
            name: data.name,
            description: data.description ?? '',
            type: data.type,
            seatTier: data.seatTier,
            price: data.price,
          }
        : undefined,
  });

  const { run: save, isLoading: isSaving } = useAction(
    (values: CreateFleet) =>
      id ? updateFleetAction(id, values) : createFleetAction(values),
    {
      successMessage: id
        ? 'Armada berhasil diperbarui'
        : 'Armada berhasil dibuat',
      onError: (m) => toast.error(m),
      onSuccess: () => {
        form.reset(EMPTY);
        hide();
        onSuccess?.();
      },
    }
  );

  const changeOpen = (next: boolean) => {
    if (!next) form.reset(EMPTY);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>{id ? 'Edit Armada' : 'Buat Armada'}</DialogTitle>
        </DialogHeader>

        {id && !data && !isLoading ? (
          <NotFoundData data="Armada" />
        ) : (
          <>
            <form
              id="form-fleet"
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
                        placeholder="Bus Pikashu 01"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Tipe</FieldLabel>
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
                            {FleetTypeOptions.map((o) => (
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
                    name="seatTier"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Kelas</FieldLabel>
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
                </div>

                <Controller
                  name="price"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Harga per kursi
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        type="number"
                        min={0}
                        step={1000}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-fleet"
                disabled={!form.formState.isValid || isSaving}
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

export { FleetFormDialog };
export type { FleetFormDialogPayload };
