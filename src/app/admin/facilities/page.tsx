'use client';

import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import { GetFacilitiesResponse } from '@/app/api/facilities/route';
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
import { deleteFacilityAction } from '@/features/facility/actions';
import { FacilityFormDialog } from '@/features/facility/components/facility-form.dialog';
import { SeatTierOptionsMap } from '@/features/facility/schemas';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { useDialogState } from '@/hooks/use-dialog';

export default function FacilitiesPage() {
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
  } = useApiPaginate<GetFacilitiesResponse>('/api/facilities', {
    params: filter,
    initialPage: 1,
    limit: 10,
    onError: (err) => toast.error(err.message),
  });

  const remove = useAction(deleteFacilityAction, {
    successMessage: 'Fasilitas berhasil dihapus',
    onSuccess: () => refresh(),
    onError: (m) => toast.error(m),
  });

  const onDelete = async (item: (typeof items)[number]) => {
    const ok = await confirm({
      title: `Hapus fasilitas ${item.title}?`,
      description:
        'Gambar fasilitas akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      confirmVariant: 'destructive',
    });
    if (ok) remove.run(item.id);
  };

  return (
    <Page>
      <FacilityFormDialog {...formDialog} onSuccess={refresh} />

      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Fasilitas' }]}
      />
      <PageHeader
        title="Fasilitas"
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
                placeholder="Cari fasilitas..."
              />
            </div>

            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Fasilitas</TableHead>
                    <TableHead>Kelas</TableHead>
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
                              src={`/api/uploads/${item.image}`}
                              alt=""
                              fill
                              unoptimized
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>
                          <div className="grid">
                            <p className="typo-label">{item.title}</p>
                            <small className="line-clamp-1 text-muted-foreground">
                              {item.description || '-'}
                            </small>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {SeatTierOptionsMap[item.seatTier].label}
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
                            <PencilIcon data-icon="inline-start" />
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
                <ChevronLeftIcon data-icon="inline-start" />
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
                <ChevronRightIcon data-icon="inline-end" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </PageSection>
    </Page>
  );
}
