'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ImagesIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  TrashIcon,
} from 'lucide-react';
import { GetFleetsResponse } from '@/app/api/fleets/route';
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
  FleetStatusOptionsMap,
  FleetTypeOptionsMap,
  SeatTierOptionsMap,
} from '@/constants/options';
import {
  deleteFleetAction,
  setFleetStatusAction,
} from '@/features/fleet/actions';
import { FleetFormDialog } from '@/features/fleet/components/fleet-form.dialog';
import { FleetImagesDialog } from '@/features/fleet/components/fleet-images.dialog';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { useDialogState } from '@/hooks/use-dialog';
import { formatCurrency } from '@/lib/utils';
import { ImgPlaceholder } from '@/assets/images';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export default function FleetsPage() {
  const confirm = useConfirm(),
    formDialog = useDialogState<{ id?: string }>(),
    imagesDialog = useDialogState<{ id: string }>();

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
  } = useApiPaginate<GetFleetsResponse>('/api/fleets', {
    params: filter,
    initialPage: 1,
    limit: 10,
    onError: (err) => toast.error(err.message),
  });

  const remove = useAction(deleteFleetAction, {
    successMessage: 'Armada berhasil dihapus',
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const power = useAction(setFleetStatusAction, {
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const onDelete = async (item: (typeof items)[number]) => {
    const ok = await confirm({
      title: `Hapus armada ${item.name}?`,
      description:
        'Armada dan semua gambarnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      confirmVariant: 'destructive',
    });
    if (ok) remove.run(item.id);
  };

  const onToggle = async (item: (typeof items)[number]) => {
    const next = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const ok = await confirm({
      title:
        next === 'ACTIVE'
          ? `Aktifkan armada ${item.name}?`
          : `Nonaktifkan armada ${item.name}?`,
      description:
        next === 'ACTIVE'
          ? 'Armada dapat dipakai untuk perjalanan baru.'
          : 'Armada tidak dapat dipakai untuk perjalanan baru.',
    });
    if (ok) power.run(item.id, next);
  };

  return (
    <Page>
      <FleetFormDialog {...formDialog} onSuccess={refresh} />
      <FleetImagesDialog {...imagesDialog} onSuccess={refresh} />

      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Armada' }]}
      />
      <PageHeader
        title="Armada"
        action={
          <Button onClick={() => formDialog.show({})}>
            <PlusIcon data-icon="inline-start" />
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
                placeholder="Cari armada..."
              />
            </div>

            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Armada</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell>{i + 1 + (page - 1) * limit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                            <Image
                              src={
                                item.images[0]
                                  ? `/api/uploads/${item.images[0].path}`
                                  : ImgPlaceholder
                              }
                              alt=""
                              fill
                              unoptimized
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div className="grid">
                            <p className="typo-label">{item.name}</p>
                            <small className="line-clamp-1 text-muted-foreground">
                              {item.description || '-'}
                            </small>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {FleetTypeOptionsMap[item.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {SeatTierOptionsMap[item.seatTier].label}
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'ACTIVE' ? 'default' : 'destructive'
                          }
                        >
                          {FleetStatusOptionsMap[item.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Gambar"
                            onClick={() => imagesDialog.show({ id: item.id })}
                          >
                            <ImagesIcon data-icon="inline-start" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Edit"
                            onClick={() => formDialog.show({ id: item.id })}
                          >
                            <PencilIcon data-icon="inline-start" />
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
                            {power.isLoading ? (
                              <Spinner data-icon="inline-start" />
                            ) : (
                              <PowerIcon data-icon="inline-start" />
                            )}
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive!"
                            title="Hapus"
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
              <Button
                size="sm"
                variant="secondary"
                disabled={isLoading}
                onClick={prev}
              >
                {isLoading ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <ChevronLeftIcon data-icon="inline-start" />
                )}
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
                {isLoading ? (
                  <Spinner data-icon="inline-end" />
                ) : (
                  <ChevronRightIcon data-icon="inline-end" />
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </PageSection>
    </Page>
  );
}
