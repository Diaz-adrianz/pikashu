import { FleetStatus, FleetType, SeatTier } from '@/generated/prisma/enums';
import z from 'zod';

export const createFleetSchema = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .min(3, 'Nama minimal 3 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
  type: z.enum(FleetType, { error: 'Tipe armada tidak valid' }),
  seatTier: z.enum(SeatTier, { error: 'Kelas kursi tidak valid' }),
  price: z
    .number({ error: 'Harga wajib diisi' })
    .int('Harga harus bilangan bulat')
    .positive('Harga harus lebih dari 0'),
});

export type CreateFleet = z.infer<typeof createFleetSchema>;

export const updateFleetSchema = createFleetSchema.partial().extend({
  status: z.enum(FleetStatus, { error: 'Status tidak valid' }).optional(),
});

export type UpdateFleet = z.infer<typeof updateFleetSchema>;
