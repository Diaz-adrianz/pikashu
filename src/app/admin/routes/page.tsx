'use client';

import { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  TrashIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { GetRoutesResponse } from '@/app/api/routes/route';
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
import {
  deleteRouteAction,
  setRouteStatusAction,
} from '@/features/route/actions';
import { RouteFormDialog } from '@/features/route/components/route-form.dialog';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { useDialogState } from '@/hooks/use-dialog';

const STATUS_LABEL = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
} as const;

export default function RoutesPage() {
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
  } = useApiPaginate<GetRoutesResponse>('/api/routes', {
    params: filter,
    initialPage: 1,
    limit: 10,
    onError: (err) => toast.error(err.message),
  });

  const remove = useAction(deleteRouteAction, {
    successMessage: 'Rute berhasil dihapus',
    onSuccess: () => refresh(),
  });

  const power = useAction(setRouteStatusAction, {
    onSuccess: () => refresh(),
  });

  const onDelete = async (item: (typeof items)[number]) => {
    const ok = await confirm({
      title: `Hapus rute ${item.name}?`,
      description:
        'Rute yang pernah digunakan tidak dapat dihapus. Nonaktifkan rute tersebut jika masih dibutuhkan.',
      confirmVariant: 'destructive',
    });
    if (ok) remove.run(item.id);
  };

  const onToggle = async (item: (typeof items)[number]) => {
    const status = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const ok = await confirm({
      title:
        status === 'ACTIVE'
          ? `Aktifkan rute ${item.name}?`
          : `Nonaktifkan rute ${item.name}?`,
      description:
        status === 'ACTIVE'
          ? 'Rute dapat dipakai untuk perjalanan baru.'
          : 'Rute tidak dapat dipakai untuk perjalanan baru.',
    });
    if (ok) power.run(item.id, status);
  };

  return (
    <Page>
      <RouteFormDialog {...formDialog} onSuccess={refresh} />

      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Rute' }]}
      />
      <PageHeader
        title="Rute"
        action={
          <Button onClick={() => formDialog.show({})}>
            <PlusIcon />
            Buat
          </Button>
        }
      />
      <PageSection>
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Search
                onSearch={(v) => setFilter((p) => ({ ...p, search: v }))}
                isLoading={isLoading}
                placeholder="Cari rute..."
              />
            </div>

            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Rute</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell>{i + 1 + (page - 1) * limit}</TableCell>
                      <TableCell>
                        <div className="grid">
                          <p className="typo-label">{item.name}</p>
                          <small className="text-muted-foreground">
                            {item.originCity} → {item.destinationCity}
                          </small>
                          <small className="text-muted-foreground">
                            {item.originLat}, {item.originLng} →{' '}
                            {item.destinationLat}, {item.destinationLng}
                          </small>
                        </div>
                      </TableCell>
                      <TableCell>{item.durationMinutes} menit</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'ACTIVE' ? 'default' : 'destructive'
                          }
                        >
                          {STATUS_LABEL[item.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Edit"
                            onClick={() => formDialog.show({ id: item.id })}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title={
                              item.status === 'ACTIVE'
                                ? 'Nonaktifkan'
                                : 'Aktifkan'
                            }
                            disabled={power.isLoading}
                            onClick={() => onToggle(item)}
                          >
                            <PowerIcon />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive!"
                            title={
                              item._count.trips > 0
                                ? 'Rute pernah digunakan; nonaktifkan saja'
                                : 'Hapus'
                            }
                            disabled={item._count.trips > 0}
                            onClick={() => onDelete(item)}
                          >
                            <TrashIcon />
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
              <Button
                size="sm"
                variant="secondary"
                disabled={isLoading}
                onClick={prev}
              >
                <ChevronLeftIcon />
                Prev
              </Button>
            )}
            {hasNext && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isLoading}
                onClick={next}
              >
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
