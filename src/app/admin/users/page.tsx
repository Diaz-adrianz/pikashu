'use client';

import { GetUsersResponse } from '@/app/api/users/route';
import { useConfirm } from '@/components/shared/confirm';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Search } from '@/components/shared/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { RoleOptionsMap, UserStatusOptionsMap } from '@/constants/options';
import { deleteUserAction } from '@/features/user/actions';
import { UserCreateDialog } from '@/features/user/components/create-user.dialog';
import {
  UserUpdateDialog,
  UserUpdateDialogPayload,
} from '@/features/user/components/update-user.dialog';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { useDialogState } from '@/hooks/use-dialog';
import { getInitials } from '@/lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Edit3Icon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function UsersPage() {
  const confirm = useConfirm(),
    createDialog = useDialogState(),
    updateDialog = useDialogState<UserUpdateDialogPayload>();

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
  } = useApiPaginate<GetUsersResponse>('/api/users', {
    params: filter,
    initialPage: 1,
    limit: 10,
    onError: (err) => toast.error(err.message),
  });

  const del = useAction(deleteUserAction, {
    successMessage: 'Akun berhasil dihapus',
    onSuccess: () => {
      refresh();
    },
    onError: (m) => toast.error(m),
  });

  const onDel = async (item: (typeof items)[number]) => {
    const ok = await confirm({
      title: `Hapus akun ${item.email}?`,
      description:
        'Akun dan semua datanya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      confirmVariant: 'destructive',
    });
    if (ok) del.run(item.id);
  };

  return (
    <Page>
      <UserCreateDialog {...createDialog} onSuccess={() => refresh()} />
      <UserUpdateDialog {...updateDialog} onSuccess={() => refresh()} />

      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Akun' }]}
      />
      <PageHeader
        title="Akun"
        action={
          <Button onClick={() => createDialog.show()}>
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
              />
            </div>

            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
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
                          <Avatar>
                            <AvatarImage src={item.image ?? ''} alt="" />
                            <AvatarFallback>
                              {getInitials(item.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid">
                            <p className="typo-label">{item.name}</p>
                            <small className="text-muted-foreground">
                              {item.email}
                            </small>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={'secondary'}>
                          {RoleOptionsMap[item.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'ACTIVE'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {UserStatusOptionsMap[item.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size={'icon-sm'}
                          variant={'ghost'}
                          onClick={() => updateDialog.show({ id: item.id })}
                        >
                          <Edit3Icon />
                        </Button>
                        <Button
                          size={'icon-sm'}
                          variant={'ghost'}
                          className="text-destructive!"
                          onClick={() => onDel(item)}
                        >
                          <TrashIcon />
                        </Button>
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
                size={'sm'}
                variant={'secondary'}
                disabled={isLoading}
                onClick={prev}
              >
                <ChevronLeftIcon />
                Prev
              </Button>
            )}
            {hasNext && (
              <Button
                size={'sm'}
                variant={'secondary'}
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
