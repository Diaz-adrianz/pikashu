'use server';

import { RouteStatus } from '@/generated/prisma/enums';
import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import {
  CreateRoute,
  createRouteSchema,
  routeStatusSchema,
  UpdateRoute,
  updateRouteSchema,
} from './schemas';
import {
  createRoute,
  deleteRoute,
  setRouteStatus,
  updateRoute,
} from './services';

export async function createRouteAction(input: CreateRoute) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(createRouteSchema, input),
      data = await createRoute(clean);
    return { ok: true, data };
  });
}

export async function updateRouteAction(id: string, input: UpdateRoute) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(updateRouteSchema, input),
      data = await updateRoute(id, clean);
    return { ok: true, data };
  });
}

export async function deleteRouteAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await deleteRoute(id);
    return { ok: true, data };
  });
}

export async function setRouteStatusAction(id: string, status: RouteStatus) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(routeStatusSchema, status),
      data = await setRouteStatus(id, clean);
    return { ok: true, data };
  });
}
