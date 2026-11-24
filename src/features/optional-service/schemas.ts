import { OptionalServiceStatus } from '@/generated/prisma/enums';
import { Option } from '@/lib/option';
import z from 'zod';

export const ServiceStatusOptionsMap: Record<
  OptionalServiceStatus,
  Option<OptionalServiceStatus>
> = {
  ACTIVE: { value: 'ACTIVE', label: 'Aktif' },
  INACTIVE: { value: 'INACTIVE', label: 'Nonaktif' },
};

export const ServiceStatusOptions = Object.values(ServiceStatusOptionsMap);

export const serviceStatusSchema = z.enum(OptionalServiceStatus, {
  error: 'Status tidak valid',
});

export const createServiceSchema = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .min(3, 'Nama minimal 3 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  price: z
    .number({ error: 'Harga wajib diisi' })
    .int('Harga harus bilangan bulat')
    .min(0, 'Harga tidak boleh negatif'),
  capacity: z
    .number({ error: 'Kapasitas wajib diisi' })
    .int('Kapasitas harus bilangan bulat')
    .positive('Kapasitas harus lebih dari 0')
    .nullable(),
});

export type CreateService = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = createServiceSchema.partial().extend({
  status: serviceStatusSchema.optional(),
});

export type UpdateService = z.infer<typeof updateServiceSchema>;
