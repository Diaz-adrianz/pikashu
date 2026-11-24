'use server';

import { z } from 'zod';
import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validate } from '@/lib/zod';
import { createBookingSchema, CreateBooking } from './schemas';
import {
  cancelBooking,
  createBooking,
  createPaymentAttempt,
  requestRefund,
} from './services';

export async function createBookingAction(input: CreateBooking) {
  return actionHandler(async () => {
    const session = await authorized(['PASSENGER'], 'throw');
    const clean = validate(createBookingSchema, input);
    const data = await createBooking(session.user.id, clean);
    return { ok: true, data };
  });
}

export async function cancelBookingAction(code: string) {
  return actionHandler(async () => {
    const session = await authorized(['PASSENGER'], 'throw');
    const data = await cancelBooking(session.user.id, code);
    return { ok: true, data };
  });
}

export async function createPaymentAction(bookingId: string) {
  return actionHandler(async () => {
    const session = await authorized(['PASSENGER'], 'throw');
    const data = await createPaymentAttempt(session.user.id, bookingId);
    return { ok: true, data };
  });
}

const refundSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(3, 'Alasan wajib diisi'),
});

export async function requestRefundAction(input: z.infer<typeof refundSchema>) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(refundSchema, input);
    const data = await requestRefund(clean.orderId, clean.reason);
    return { ok: true, data };
  });
}

export async function completeRefundAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await prisma.refund.update({
      where: { id },
      data: { status: 'SUCCEEDED' },
    });
    return { ok: true, data };
  });
}
