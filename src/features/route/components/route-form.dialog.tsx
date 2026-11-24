'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Controller,
  useForm,
  type Control,
  type FieldPath,
} from 'react-hook-form';
import z from 'zod';
import { toast } from 'sonner';
import { GetRouteResponse } from '@/app/api/routes/[id]/route';
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
import { createRouteAction, updateRouteAction } from '../actions';
import { createRouteSchema, CreateRoute } from '../schemas';

type RouteFormDialogPayload = { id?: string };

const routeFormSchema = createRouteSchema.extend({
  path: z.string().optional(),
});

type RouteFormValues = z.infer<typeof routeFormSchema>;

const EMPTY: RouteFormValues = {
  name: '',
  originCity: '',
  destinationCity: '',
  originLat: 0,
  originLng: 0,
  destinationLat: 0,
  destinationLng: 0,
  durationMinutes: 0,
  path: '',
  status: 'ACTIVE',
};

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'INACTIVE', label: 'Nonaktif' },
] as const;

type NumericFieldName =
  | 'originLat'
  | 'originLng'
  | 'destinationLat'
  | 'destinationLng'
  | 'durationMinutes';

function NumberField({
  control,
  name,
  label,
  min,
  max,
}: {
  control: Control<RouteFormValues>;
  name: NumericFieldName;
  label: string;
  min?: number;
  max?: number;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            type="number"
            min={min}
            max={max}
            step="any"
            value={Number.isNaN(field.value) ? '' : field.value}
            aria-invalid={fieldState.invalid}
            onChange={(e) =>
              field.onChange(
                e.target.value === '' ? NaN : Number(e.target.value)
              )
            }
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

function RouteFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
  onSuccess,
}: DialogState<RouteFormDialogPayload> & { onSuccess?: () => void }) {
  const id = payload?.id;

  const { item: data, isLoading } = useApi<GetRouteResponse>(
    `/api/routes/${id}`,
    {
      enabled: !!id && open,
      onError: (e) => toast.error(e.message),
    }
  );

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY,
    values:
      id && data
        ? {
            name: data.name,
            originCity: data.originCity,
            destinationCity: data.destinationCity,
            originLat: data.originLat,
            originLng: data.originLng,
            destinationLat: data.destinationLat,
            destinationLng: data.destinationLng,
            durationMinutes: data.durationMinutes,
            path: data.path == null ? '' : JSON.stringify(data.path, null, 2),
            status: data.status,
          }
        : undefined,
  });

  const { run: save, isLoading: isSaving } = useAction(
    (values: RouteFormValues) => {
      let path: CreateRoute['path'] = null;
      if (values.path?.trim()) {
        try {
          path = JSON.parse(values.path) as CreateRoute['path'];
        } catch {
          form.setError('path', { message: 'JSON tidak valid' });
          return Promise.resolve({
            ok: false as const,
            message: 'JSON tidak valid',
          });
        }
      }
      return id
        ? updateRouteAction(id, { ...values, path })
        : createRouteAction({ ...values, path });
    },
    {
      successMessage: id ? 'Rute berhasil diperbarui' : 'Rute berhasil dibuat',
      onError: (message, fieldErrors) => {
        Object.entries(fieldErrors ?? {}).forEach(([name, errors]) => {
          if (errors?.[0])
            form.setError(name as FieldPath<RouteFormValues>, {
              message: errors[0],
            });
        });
        if (!fieldErrors) toast.error(message);
      },
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

  const submit = form.handleSubmit((values) => save(values));

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent>
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>{id ? 'Edit Rute' : 'Buat Rute'}</DialogTitle>
        </DialogHeader>

        {id && !data && !isLoading ? (
          <NotFoundData data="Rute" />
        ) : (
          <>
            <form
              id="form-route"
              onSubmit={submit}
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
                        placeholder="Jakarta - Bandung"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="originCity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Kota asal</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Jakarta"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="destinationCity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Kota tujuan
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Bandung"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    control={form.control}
                    name="originLat"
                    label="Latitude asal"
                    min={-90}
                    max={90}
                  />
                  <NumberField
                    control={form.control}
                    name="originLng"
                    label="Longitude asal"
                    min={-180}
                    max={180}
                  />
                  <NumberField
                    control={form.control}
                    name="destinationLat"
                    label="Latitude tujuan"
                    min={-90}
                    max={90}
                  />
                  <NumberField
                    control={form.control}
                    name="destinationLng"
                    label="Longitude tujuan"
                    min={-180}
                    max={180}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    control={form.control}
                    name="durationMinutes"
                    label="Durasi (menit)"
                    min={1}
                  />
                  <Controller
                    name="status"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Status</FieldLabel>
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
                            {STATUS_OPTIONS.map((o) => (
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
                  name="path"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Path GeoJSON (opsional)
                      </FieldLabel>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        rows={4}
                        placeholder='{"type":"FeatureCollection","features":[]}'
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
                form="form-route"
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

export { RouteFormDialog };
export type { RouteFormDialogPayload };
