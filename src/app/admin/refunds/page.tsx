'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { GetAdminRefundsResponse } from '@/app/api/admin/refunds/route';
import { useConfirm } from '@/components/shared/confirm';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  completeRefundAction,
  requestRefundAction,
} from '@/features/booking/actions';
import { useAction } from '@/hooks/use-action';
import { useApiPaginate } from '@/hooks/use-api';
import { formatCurrency } from '@/lib/utils';

type RefundForm = { orderId: string; reason: string };

export default function RefundsPage() {
  const confirm = useConfirm();
  const [form, setForm] = useState<RefundForm>({ orderId: '', reason: '' });

  const { refresh, items, total, hasNext, hasPrev, next, prev, isLoading } =
    useApiPaginate<GetAdminRefundsResponse>('/api/admin/refunds', {
      initialPage: 1,
      limit: 10,
      onError: (err) => toast.error(err.message),
    });

  const complete = useAction(completeRefundAction, {
    successMessage: 'Refund ditandai selesai',
    onSuccess: () => refresh(),
  });
  const request = useAction(requestRefundAction, {
    successMessage: 'Refund diajukan',
    onSuccess: () => {
      setForm({ orderId: '', reason: '' });
      refresh();
    },
  });

  const onComplete = async (id: string, code: string) => {
    const ok = await confirm({
      title: `Tandai refund ${code} selesai?`,
      description: 'Pastikan dana sudah dikembalikan kepada penumpang.',
      confirmText: 'Tandai selesai',
    });
    if (ok) complete.run(id);
  };

  return (
    <Page>
      <PageNav
        items={[{ label: 'Admin', href: '/admin' }, { label: 'Refund' }]}
      />
      <PageHeader
        title="Refund"
        description="Pengajuan dan tindak lanjut refund."
      />

      <PageSection>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Ajukan refund manual</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.orderId || form.reason.trim().length < 3) return;
                request.run(form);
              }}
            >
              <FieldGroup className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] md:items-start">
                <Field className="gap-1">
                  <FieldLabel className="typo-label" htmlFor="order-id">
                    Order ID
                  </FieldLabel>
                  <Input
                    id="order-id"
                    value={form.orderId}
                    placeholder="PKH-XXXXXXXX"
                    required
                    onChange={(e) =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        orderId: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field className="gap-1">
                  <FieldLabel className="typo-label" htmlFor="refund-reason">
                    Alasan
                  </FieldLabel>
                  <Textarea
                    id="refund-reason"
                    value={form.reason}
                    placeholder="Alasan refund"
                    minLength={3}
                    required
                    onChange={(e) =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        reason: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Button
                  type="submit"
                  className="md:mt-6"
                  disabled={request.isLoading}
                >
                  {request.isLoading && <Spinner data-icon="inline-start" />}
                  Ajukan refund
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection>
        <Card>
          <CardContent>
            <div className="rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode booking</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Diajukan</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="typo-label">
                        {item.payment.booking.code}
                      </TableCell>
                      <TableCell>{item.payment.orderId}</TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'SUCCEEDED'
                              ? 'default'
                              : item.status === 'FAILED'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-64 whitespace-normal">
                        {item.reason}
                      </TableCell>
                      <TableCell>
                        {format(item.createdAt, 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {['PENDING', 'PROCESSING'].includes(item.status) && (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="Tandai selesai"
                              disabled={complete.isLoading}
                              onClick={() =>
                                onComplete(item.id, item.payment.booking.code)
                              }
                            >
                              {complete.isLoading ? (
                                <Spinner data-icon="inline-start" />
                              ) : (
                                <CircleCheckIcon data-icon="inline-start" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!items.length && !isLoading && (
                    <TableRow>
                      <TableCell
                        className="text-center text-muted-foreground"
                        colSpan={7}
                      >
                        Belum ada refund.
                      </TableCell>
                    </TableRow>
                  )}
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
