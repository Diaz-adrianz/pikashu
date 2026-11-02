'use client';

import { GetUsersResponse } from '@/app/api/users/route';
import { Container } from '@/components/shared/container';
import { PageHeader } from '@/components/shared/page-header';
import { SearchBarClient } from '@/components/shared/search-bar';
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
import { useApiPaginate } from '@/infra/api/hooks/use-api';
import { RoleOptionsMap } from '@/lib/next-auth/options';
import { getInitials } from '@/utils/string';
import { RiArrowLeftLine, RiArrowRightLine } from '@remixicon/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const [filter, setFilter] = useState({ search: '' });

  const { items, total, hasNext, hasPrev, next, prev, page, limit, isLoading } =
    useApiPaginate<GetUsersResponse>('/api/users', {
      params: filter,
      initialPage: 1,
      limit: 10,
      onError: (err) => toast.warning(err.message),
    });

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Admin', path: '/admin' },
          { label: 'IAM' },
          { label: 'User' },
        ]}
        title={'User'}
      />

      <Container className="mb-4">
        <Card>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <SearchBarClient
                onSearch={(v) => setFilter((p) => ({ ...p, search: v }))}
                isLoading={isLoading}
                totalItems={total}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
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
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            {hasPrev && (
              <Button
                size={'icon-sm'}
                variant={'secondary'}
                disabled={isLoading}
                onClick={prev}
              >
                <RiArrowLeftLine />
              </Button>
            )}
            {hasNext && (
              <Button
                size={'icon-sm'}
                variant={'secondary'}
                disabled={isLoading}
                onClick={next}
              >
                <RiArrowRightLine />
              </Button>
            )}
          </CardFooter>
        </Card>
      </Container>
    </>
  );
}
