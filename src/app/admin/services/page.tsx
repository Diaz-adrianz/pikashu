'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  TrashIcon,
} from 'lucide-react';
import { GetServicesResponse } from '@/app/api/services/route';
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
  deleteServiceAction,
  setServiceStatusAction,
} from '@/features/optional-service/actions';
import { ServiceFormDialog } from '@/features/optional-service/components/service-form.dialog';
import { ServiceStatusOptionsMap } from '@/features/optional-service/schemas';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { useDialogState } from '@/hooks/use-dialog';
import { formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
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
  } = useApiPaginate<GetServicesResponse>('/api/services', {
    params: filter,
    initialPage: 1,
    limit: 10,
    onError: (err) => toast.error(err.message),
  });

  const remove = useAction(deleteServiceAction, {
    successMessage: 'Layanan berhasil dihapus',
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const power = useAction(setServiceStatusAction, {
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const onDelete = async (item: (typeof items)[number]) => {
    const ok = await confirm({
      title: `Hapus layanan ${item.name}?`,
      description:
        'Layanan yang pernah digunakan tidak dapat dihapus. Tindakan ini tidak dapat dibatalkan.',
      confirmVariant: 'destructive',
    });
    if (ok) remove.run(item.id);
  };

  const onToggle = async (item: (typeof items)[number]) => {
    const next = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const ok = await confirm({
      title:
        next === 'ACTIVE'
          ? `Aktifkan layanan ${item.name}?`
          : `Nonaktifkan layanan ${item.name}?`,
      description:
        next === 'ACTIVE'
          ? 'Layanan dapat dipilih pada perjalanan baru.'
          : 'Layanan tidak dapat dipilih pada perjalanan baru.',
    });
    if (ok) power.run(item.id, next);
  };

  return (
    <Page>
      <ServiceFormDialog {...formDialog} onSuccess={refresh} />

      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Layanan' }]}
      />
      <PageHeader
        title="Layanan"
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
                placeholder="Cari layanan..."
              />
            </div>

            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Kapasitas</TableHead>
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
                          <small className="line-clamp-1 text-muted-foreground">
                            {item.description || '-'}
                          </small>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        {item.capacity === null ? 'Tanpa batas' : item.capacity}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'ACTIVE' ? 'default' : 'destructive'
                          }
                        >
                          {ServiceStatusOptionsMap[item.status].label}
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
                            title="Hapus"
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
