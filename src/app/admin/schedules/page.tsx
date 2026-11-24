'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RefreshCwIcon,
  TrashIcon,
} from 'lucide-react';
import { GetSchedulesResponse } from '@/app/api/schedules/route';
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
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  deleteScheduleAction,
  generateTripsAction,
  updateScheduleAction,
} from '@/features/schedule/actions';
import { ScheduleFormDialog } from '@/features/schedule/components/schedule-form.dialog';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { useDialogState } from '@/hooks/use-dialog';

export default function SchedulesPage() {
  const confirm = useConfirm(),
    formDialog = useDialogState<{ id?: string }>();
  const [filter, setFilter] = useState({ search: '' });

  const {
    refresh,
    items,
    total,
    hasNext,
    hasPrev,
    next,
    prev,
    page,
    limit,
    isLoading,
  } = useApiPaginate<GetSchedulesResponse>('/api/schedules', {
    params: filter,
    initialPage: 1,
    limit: 10,
    onError: (err) => toast.error(err.message),
  });

  const remove = useAction(deleteScheduleAction, {
    successMessage: 'Jadwal berhasil dihapus',
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const toggle = useAction(updateScheduleAction, {
    successMessage: 'Status jadwal diperbarui',
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const generate = useAction(generateTripsAction, {
    onSuccess: (count) =>
      toast.success(`${count} perjalanan baru dibuat`),
    onError: (m) => toast.error(m),
  });

  const onDelete = async (item: (typeof items)[number]) => {
    const ok = await confirm({
      title: `Hapus jadwal ${item.route.name}?`,
      description: 'Jadwal yang pernah dipakai tidak dapat dihapus.',
      confirmVariant: 'destructive',
    });
    if (ok) remove.run(item.id);
  };

  const onToggle = async (item: (typeof items)[number]) => {
    const status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const ok = await confirm({
      title: `${status === 'ACTIVE' ? 'Aktifkan' : 'Nonaktifkan'} jadwal?`,
    });
    if (ok) toggle.run(item.id, { status });
  };

  return (
    <Page>
      <ScheduleFormDialog {...formDialog} onSuccess={() => refresh()} />

      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Jadwal' }]}
      />
      <PageHeader
        title="Jadwal"
        action={
          <>
            <Button
              variant="secondary"
              disabled={generate.isLoading}
              onClick={() => generate.run()}
            >
              {generate.isLoading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon data-icon="inline-start" />
              )}
              Buat Perjalanan
            </Button>
            <Button onClick={() => formDialog.show({})}>
              <PlusIcon data-icon="inline-start" />
              Buat
            </Button>
          </>
        }
      />
      <PageSection>
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Search
                onSearch={(v) => setFilter((p) => ({ ...p, search: v }))}
                isLoading={isLoading}
                placeholder="Cari jadwal..."
              />
            </div>

            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Armada</TableHead>
                    <TableHead>Berangkat</TableHead>
                    <TableHead>Perjalanan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell>{i + 1 + (page - 1) * limit}</TableCell>
                      <TableCell>
                        <p className="typo-label">{item.route.name}</p>
                        <small className="text-muted-foreground">
                          {item.route.originCity} → {item.route.destinationCity}
                        </small>
                      </TableCell>
                      <TableCell>{item.fleet.name}</TableCell>
                      <TableCell>{item.departureTime}</TableCell>
                      <TableCell>{item._count.trips}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'ACTIVE' ? 'default' : 'destructive'
                          }
                        >
                          {item.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => formDialog.show({ id: item.id })}
                          >
                            <PencilIcon data-icon="inline-start" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            disabled={toggle.isLoading}
                            onClick={() => onToggle(item)}
                          >
                            {toggle.isLoading ? (
                              <Spinner data-icon="inline-start" />
                            ) : (
                              <PowerIcon data-icon="inline-start" />
                            )}
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive!"
                            onClick={() => onDelete(item)}
                          >
                            <TrashIcon data-icon="inline-start" />
                          </Button>
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
                <ChevronLeftIcon data-icon="inline-start" />
                Prev
              </Button>
            )}
            {hasNext && (
              <Button size="sm" variant="secondary" onClick={next}>
                Next
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </PageSection>
    </Page>
  );
}
