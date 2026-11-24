'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SaveIcon } from 'lucide-react';
import { GetAdminTripResponse } from '@/app/api/admin/trips/[id]/route';
import { useAction } from '@/hooks/use-action';
import { useApi } from '@/hooks/use-api';
import { DialogState } from '@/hooks/use-dialog';
import { ApiResponsePaginate } from '@/lib/api';
import { assignStaffAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';

type StaffItem = { id: string; name: string | null; email: string | null };

type StaffDialogPayload = { id: string };

function StaffAssignmentDialog({
  open,
  onOpenChange,
  payload,
  onSuccess,
}: DialogState<StaffDialogPayload> & { onSuccess?: () => void }) {
  const { item: trip, isLoading } = useApi<GetAdminTripResponse>(
    `/api/admin/trips/${payload?.id}`,
    { enabled: !!payload?.id && open, onError: (e) => toast.error(e.message) }
  );
  const { item: users } = useApi<
    ApiResponsePaginate<{
      id: string;
      name: string | null;
      email: string | null;
      role: string;
      status: string;
    }>
  >('/api/users?limit=100', { enabled: open, onError: (e) => toast.error(e.message) });

  const staff = useMemo(
    () =>
      (users?.items ?? []).filter(
        (u) => u.role === 'STAFF' && u.status === 'ACTIVE'
      ),
    [users]
  );
  const [selection, setSelection] = useState<{
    tripId?: string;
    ids: string[];
  }>({ ids: [] });
  const selected =
    selection.tripId === trip?.id
      ? selection.ids
      : (trip?.staff.map((s) => s.staffId) ?? []);

  const { run: save, isLoading: isSaving } = useAction(assignStaffAction, {
    successMessage: 'Penugasan staf diperbarui',
    onError: (m) => toast.error(m),
    onSuccess: () => {
      hide();
      onSuccess?.();
    },
  });

  function hide() {
    onOpenChange(false);
  }

  const toggle = (id: string) =>
    setSelection((prev) => {
      const ids =
        prev.tripId === trip?.id
          ? prev.ids
          : (trip?.staff.map((s) => s.staffId) ?? []);
      return {
        tripId: trip?.id,
        ids: ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id],
      };
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next)
          setSelection({
            tripId: undefined,
            ids: trip?.staff.map((s) => s.staffId) ?? [],
          });
        onOpenChange(next);
      }}
    >
      <DialogContent>
        {isLoading && <LoadingOverlay />}
        <DialogHeader>
          <DialogTitle>Tuguhkan Staf</DialogTitle>
        </DialogHeader>

        {!trip && !isLoading ? (
          <NotFoundData data="Perjalanan" />
        ) : (
          <>
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-xl border p-3">
              {staff.map((s: StaffItem) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted"
                >
                  <Checkbox
                    checked={selected.includes(s.id)}
                    onCheckedChange={() => toggle(s.id)}
                  />
                  <span className="grid">
                    <span className="typo-label">{s.name}</span>
                    <small className="text-muted-foreground">{s.email}</small>
                  </span>
                </label>
              ))}
              {staff.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Belum ada staf aktif.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                className="w-full"
                disabled={isSaving || !trip}
                onClick={() => trip && save(trip.id, selected)}
              >
                <SaveIcon />
                Simpan
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { StaffAssignmentDialog };
