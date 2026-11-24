import z from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  phone: z
    .string()
    .max(20, 'Nomor telepon terlalu panjang')
    .optional()
    .nullable(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Password minimal 8 karakter'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama',
  });

export type ChangePassword = z.infer<typeof changePasswordSchema>;
