import { SeatTier } from '@/generated/prisma/enums';
import { Option } from '@/lib/option';
import z from 'zod';

export const SeatTierOptionsMap: Record<SeatTier, Option<SeatTier>> = {
  ECONOMY: { value: 'ECONOMY', label: 'Ekonomi' },
  BUSINESS: { value: 'BUSINESS', label: 'Bisnis' },
};

export const SeatTierOptions = Object.values(SeatTierOptionsMap);

export const createFacilitySchema = z.object({
  seatTier: z.enum(SeatTier, { error: 'Kelas kursi tidak valid' }),
  title: z
    .string({ error: 'Judul wajib diisi' })
    .min(3, 'Judul minimal 3 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional(),
});

export type CreateFacility = z.infer<typeof createFacilitySchema>;

export const updateFacilitySchema = createFacilitySchema.partial();

export type UpdateFacility = z.infer<typeof updateFacilitySchema>;
