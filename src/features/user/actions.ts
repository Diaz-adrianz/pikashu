'use server';

import { actionHandler } from '@/lib/action';
import {
  CreateUser,
  createUserSchema,
  RegisterUser,
  registerUserSchema,
  UpdateUser,
  updateUserSchema,
} from './schemas';
import { validate } from '@/lib/zod';
import { createUser, deleteUser, registerUser, updateUser } from './services';

export async function registerUserAction(input: RegisterUser) {
  return actionHandler(async () => {
    const clean = validate(registerUserSchema, input),
      data = await registerUser(clean);
    return { ok: true, data };
  });
}

export async function createUserAction(input: CreateUser) {
  return actionHandler(async () => {
    const clean = validate(createUserSchema, input),
      data = await createUser(clean);
    return { ok: true, data };
  });
}

export async function updateUserAction(id: string, input: UpdateUser) {
  return actionHandler(async () => {
    const clean = validate(updateUserSchema, input),
      data = await updateUser(id, clean);
    return { ok: true, data };
  });
}

export async function deleteUserAction(id: string) {
  return actionHandler(async () => {
    const data = await deleteUser(id);
    return { ok: true, data };
  });
}
