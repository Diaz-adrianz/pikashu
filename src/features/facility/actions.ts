'use server';

import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import { createFacilitySchema, updateFacilitySchema } from './schemas';
import {
  createFacility,
  deleteFacility,
  optionalFacilityImage,
  updateFacility,
  validateFacilityImage,
} from './services';

const fields = (form: FormData) => {
  const str = (key: string) => {
    const value = form.get(key);
    return typeof value === 'string' ? value : undefined;
  };
  return {
    seatTier: str('seatTier'),
    title: str('title'),
    description: str('description'),
  };
};

export async function createFacilityAction(form: FormData) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(createFacilitySchema, fields(form)),
      image = validateFacilityImage(form.get('image')),
      data = await createFacility(clean, image);
    return { ok: true, data };
  });
}

export async function updateFacilityAction(id: string, form: FormData) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const clean = validate(updateFacilitySchema, fields(form)),
      image = optionalFacilityImage(form.get('image')),
      data = await updateFacility(id, clean, image);
    return { ok: true, data };
  });
}

export async function deleteFacilityAction(id: string) {
  return actionHandler(async () => {
    await authorized(['ADMIN'], 'throw');
    const data = await deleteFacility(id);
    return { ok: true, data };
  });
}
