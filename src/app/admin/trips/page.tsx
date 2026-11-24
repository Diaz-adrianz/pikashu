'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleXIcon,
  UsersIcon,
} from 'lucide-react';
import { GetAdminTripsResponse } from '@/app/api/admin/trips/route';
import { useConfirm } from '@/components/shared/confirm';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Search } from '@/components/shared/search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cancelTripAction } from '@/features/trip/actions';
import { StaffAssignmentDialog } from '@/features/trip/components/staff-assignment.dialog';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { useDialogState } from '@/hooks/use-dialog';

export default function TripsPage() {
  const confirm = useConfirm(),
    staffDialog = useDialogState<{ id: string }>();
  const [filter, setFilter] = useState({ search: '', status: '' });

  const {
    refresh,
    items,
    total,
    hasNext,
    hasPrev,
    next,
    prev,
    isLoading,
  } = useApiPaginate<GetAdminTripsResponse>('/api/admin/trips', {
    params: filter,
    initialPage: 1,
    limit: 10,
    onError: (err) => toast.error(err.message),
  });

  const cancel = useAction(cancelTripAction, {
    successMessage: 'Perjalanan dibatalkan',
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const onCancel = async (item: (typeof items)[number]) => {
    const ok = await confirm({
      title: `Batalkan perjalanan ${item.route.name}?`,
      description: 'Semua pemesanan akan dibatalkan dan refund diproses.',
      confirmVariant: 'destructive',
    });
    if (ok) cancel.run(item.id);
  };

  return (
    <Page>
      <StaffAssignmentDialog {...staffDialog} onSuccess={() => refresh()} />

      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Perjalanan' }]}
      />
      <PageHeader title="Perjalanan" />
      <PageSection>
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Search
                onSearch={(v) => setFilter((p) => ({ ...p, search: v }))}
                isLoading={isLoading}
                placeholder="Cari perjalanan..."
              />
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, status: e.target.value }))
                }
                className="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm"
              >
                <option value="">Semua status</option>
                <option value="SCHEDULED">Terjadwal</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>

            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rute</TableHead>
                    <TableHead>Berangkat</TableHead>
                    <TableHead>Armada</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Kursi</TableHead>
                    <TableHead>Staf</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="typo-label">{item.route.name}</p>
                        <small className="text-muted-foreground">
                          {item.route.originCity} → {item.route.destinationCity}
                        </small>
                      </TableCell>
                      <TableCell>
                        {format(item.departureAt, 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{item.fleet.name}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('id-ID').format(item.price)}
                      </TableCell>
                      <TableCell>
                        {item.sold}/{item.capacity}
                      </TableCell>
                      <TableCell>{item.staff.length}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'SCHEDULED'
                              ? 'default'
                              : item.status === 'CANCELLED'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Tuguhkan staf"
                            onClick={() => staffDialog.show({ id: item.id })}
                          >
                            <UsersIcon />
                          </Button>
                          {item.status === 'SCHEDULED' && (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              className="text-destructive!"
                              title="Batalkan"
                              disabled={cancel.isLoading}
                              onClick={() => onCancel(item)}
                            >
                              <CircleXIcon />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <p className="me-auto typo-caption text-muted-foreground">
              {total} total
            </p>
            {hasPrev && (
              <Button size="sm" variant="secondary" onClick={prev}>
                <ChevronLeftIcon />
                Prev
              </Button>
            )}
            {hasNext && (
              <Button size="sm" variant="secondary" onClick={next}>
                Next
                <ChevronRightIcon />
              </Button>
            )}
          </CardFooter>
        </Card>
      </PageSection>
    </Page>
  );
}
