'use server';

import { OptionalServiceStatus } from '@/generated/prisma/enums';
import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import {
  CreateService,
  createServiceSchema,
  serviceStatusSchema,
  UpdateService,
  updateServiceSchema,
} from './schemas';
import {
  createService,
  deleteService,
  setServiceStatus,
  updateService,
} from './services';

export async function createServiceAction(input: CreateService) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(createServiceSchema, input),
      data = await createService(clean);
    return { ok: true, data };
  });
}

export async function updateServiceAction(id: string, input: UpdateService) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(updateServiceSchema, input),
      data = await updateService(id, clean);
    return { ok: true, data };
  });
}

export async function setServiceStatusAction(
  id: string,
  status: OptionalServiceStatus
) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(serviceStatusSchema, status),
      data = await setServiceStatus(id, clean);
    return { ok: true, data };
  });
}

export async function deleteServiceAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await deleteService(id);
    return { ok: true, data };
  });
}
