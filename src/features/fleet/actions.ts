'use server';

import { actionHandler, ActionError } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import { FleetStatus } from '@/generated/prisma/enums';
import { CreateFleet, createFleetSchema, UpdateFleet, updateFleetSchema } from './schemas';
import {
  addFleetImage,
  createFleet,
  deleteFleet,
  deleteFleetImage,
  setFleetStatus,
  setMainFleetImage,
  updateFleet,
} from './services';

export async function createFleetAction(input: CreateFleet) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(createFleetSchema, input),
      data = await createFleet(clean);
    return { ok: true, data };
  });
}

export async function updateFleetAction(id: string, input: UpdateFleet) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(updateFleetSchema, input),
      data = await updateFleet(id, clean);
    return { ok: true, data };
  });
}

export async function deleteFleetAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await deleteFleet(id);
    return { ok: true, data };
  });
}

export async function setFleetStatusAction(id: string, status: FleetStatus) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await setFleetStatus(id, status);
    return { ok: true, data };
  });
}

export async function uploadFleetImageAction(fleetId: string, form: FormData) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const file = form.get('file');
    if (!(file instanceof File)) throw new ActionError('File wajib diunggah');

    const data = await addFleetImage(fleetId, file);
    return { ok: true, data };
  });
}

export async function deleteFleetImageAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await deleteFleetImage(id);
    return { ok: true, data };
  });
}

export async function setMainFleetImageAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await setMainFleetImage(id);
    return { ok: true, data };
  });
}
