'use server';

import { z } from 'zod';
import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import { boardTicket } from './services';

const boardSchema = z.object({
  token: z.string().min(10, 'QR tidak valid'),
});

export async function boardTicketAction(input: z.infer<typeof boardSchema>) {
  return actionHandler(async () => {
    const session = await authorized(['STAFF'], 'throw');
    const clean = validate(boardSchema, input);
    const data = await boardTicket(session.user.id, clean.token);
    return { ok: true, data };
  });
}
