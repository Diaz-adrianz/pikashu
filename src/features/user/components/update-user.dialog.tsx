import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoleOptions } from '@/constants/options';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { DialogState } from '@/hooks/use-dialog';
import { updateUserAction } from '../actions';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import { UpdateUser, updateUserSchema } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type UserUpdateDialogPayload = { id: string };

function UserUpdateDialog({
  open,
  onOpenChange,
  hide,
  payload,
  onSuccess,
}: DialogState<UserUpdateDialogPayload> & { onSuccess?: () => void }) {
  const { item: data, isLoading } = useApi(`/api/users/${payload?.id}`, {
      enabled: !!payload?.id && open,
      onError: (e) => toast.error(e.message),
    }),
    update = useAction(updateUserAction, {
      successMessage: 'Akun berhasil diperbarui',
      onError: (m) => toast.error(m),
      onSuccess: () => {
        hide();
        onSuccess?.();
      },
    });

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    defaultValues: { name: '', email: '', role: 'STAFF' },
    values: data && { ...data },
  });

  const onUpdate = (values: UpdateUser) => {
    if (data) update.run(data.id, values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>Edit Akun</DialogTitle>
        </DialogHeader>

        {!data && !isLoading && open ? (
          <NotFoundData resource="Akun" />
        ) : (
          <>
            <form
              id="form-user-update"
              onSubmit={form.handleSubmit(onUpdate)}
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
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        type="email"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="role"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Role</FieldLabel>
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
                          {RoleOptions.map((o) => (
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
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-user-update"
                disabled={!form.formState.isValid || update.isLoading}
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

export { UserUpdateDialog };
export type { UserUpdateDialogPayload };
