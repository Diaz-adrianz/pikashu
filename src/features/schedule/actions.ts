'use server';

import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import {
  CreateSchedule,
  createScheduleSchema,
  UpdateSchedule,
  updateScheduleSchema,
} from './schemas';
import {
  createSchedule,
  deleteSchedule,
  generateTrips,
  updateSchedule,
} from './services';

export async function createScheduleAction(input: CreateSchedule) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(createScheduleSchema, input),
      data = await createSchedule(clean);
    return { ok: true, data };
  });
}

export async function updateScheduleAction(id: string, input: UpdateSchedule) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(updateScheduleSchema, input),
      data = await updateSchedule(id, clean);
    return { ok: true, data };
  });
}

export async function deleteScheduleAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await deleteSchedule(id);
    return { ok: true, data };
  });
}

export async function generateTripsAction() {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await generateTrips();
    return { ok: true, data };
  });
}
