'use server';

import { actionHandler } from '@/lib/action';
import { authorized } from '@/lib/auth';
import { validate } from '@/lib/zod';
import {
  ChangePassword,
  changePasswordSchema,
  UpdateProfile,
  updateProfileSchema,
} from './profile-schemas';
import { changePassword, updateProfile } from './services';

export async function updateProfileAction(input: UpdateProfile) {
  return actionHandler(async () => {
    const session = await authorized(['PASSENGER', 'STAFF', 'ADMIN'], 'throw');
    const clean = validate(updateProfileSchema, input);
    const data = await updateProfile(session.user.id, clean);
    return { ok: true, data };
  });
}

export async function changePasswordAction(input: ChangePassword) {
  return actionHandler(async () => {
    const session = await authorized(['PASSENGER', 'STAFF', 'ADMIN'], 'throw');
    const clean = validate(changePasswordSchema, input);
    await changePassword(session.user.id, clean);
    return { ok: true, data: undefined };
  });
}
