import { Role } from '@/generated/prisma/enums';
import z from 'zod';

export const registerUserSchema = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .min(3, 'Nama minimal 3 karakter'),
  email: z.email({ error: 'Email tidak valid' }),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(8, { error: 'Password minimal 8 karakter' }),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

export const createUserSchema = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .min(3, 'Nama minimal 3 karakter'),
  email: z.email({ error: 'Email tidak valid' }),
  password: z
    .string({ error: 'Password wajib diisi' })
    .min(8, { error: 'Password minimal 8 karakter' }),
  role: z.enum(Role, { error: 'Role tidak valid' }),
});

export type CreateUser = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').optional(),
  email: z.email({ error: 'Email tidak valid' }).optional(),
  role: z.enum(Role, { error: 'Role tidak valid' }).optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
