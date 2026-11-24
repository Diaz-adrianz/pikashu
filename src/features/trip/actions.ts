'use server';

import z from 'zod';
import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import { assignStaff, cancelTrip } from './services';

const assignSchema = z.object({
  staffIds: z.array(z.string()).max(50),
});

export async function cancelTripAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await cancelTrip(id);
    return { ok: true, data };
  });
}

export async function assignStaffAction(id: string, staffIds: string[]) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(assignSchema, { staffIds });
    const data = await assignStaff(id, clean.staffIds);
    return { ok: true, data };
  });
}
