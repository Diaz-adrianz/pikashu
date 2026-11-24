'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { DialogState } from '@/hooks/use-dialog';
import { ApiResponse } from '@/lib/api';
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
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';
import { GetScheduleResponse } from '@/app/api/schedules/[id]/route';
import { CreateSchedule, createScheduleSchema } from '../schemas';
import { createScheduleAction, updateScheduleAction } from '../actions';

type RouteItem = {
  id: string;
  name: string;
  originCity: string;
  destinationCity: string;
};
type FleetItem = { id: string; name: string };

type ScheduleFormDialogPayload = { id?: string };

const EMPTY: CreateSchedule = {
  routeId: '',
  fleetId: '',
  departureTime: '08:00',
};

function ScheduleFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
  onSuccess,
}: DialogState<ScheduleFormDialogPayload> & { onSuccess?: () => void }) {
  const id = payload?.id;
  const { item: data, isLoading } = useApi<GetScheduleResponse>(
    `/api/schedules/${id}`,
    { enabled: !!id && open, onError: (e) => toast.error(e.message) }
  );
  const { item: routes } = useApi<ApiResponse<{ items: RouteItem[] }>>(
    '/api/routes?limit=100',
    { enabled: open, onError: (e) => toast.error(e.message) }
  );
  const { item: fleets } = useApi<ApiResponse<{ items: FleetItem[] }>>(
    '/api/fleets?limit=100',
    { enabled: open, onError: (e) => toast.error(e.message) }
  );

  const form = useForm<CreateSchedule>({
    resolver: zodResolver(createScheduleSchema),
    mode: 'onChange',
    defaultValues: EMPTY,
    values:
      id && data
        ? {
            routeId: data.routeId,
            fleetId: data.fleetId,
            departureTime: data.departureTime,
          }
        : undefined,
  });

  const { run: save, isLoading: isSaving } = useAction(
    (values: CreateSchedule) =>
      id ? updateScheduleAction(id, values) : createScheduleAction(values),
    {
      successMessage: id ? 'Jadwal berhasil diperbarui' : 'Jadwal berhasil dibuat',
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
          <DialogTitle>{id ? 'Edit Jadwal' : 'Buat Jadwal'}</DialogTitle>
        </DialogHeader>

        {id && !data && !isLoading ? (
          <NotFoundData data="Jadwal" />
        ) : (
          <>
            <form
              id="form-schedule"
              onSubmit={form.handleSubmit((v) => save(v))}
              className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <Controller
                  name="routeId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Rute</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Pilih rute" />
                        </SelectTrigger>
                        <SelectContent>
                          {routes?.items.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name} · {r.originCity} → {r.destinationCity}
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
                  name="fleetId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Armada</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Pilih armada" />
                        </SelectTrigger>
                        <SelectContent>
                          {fleets?.items.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
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
                  name="departureTime"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Jam berangkat</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="time"
                        aria-invalid={fieldState.invalid}
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
                form="form-schedule"
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

export { ScheduleFormDialog };
