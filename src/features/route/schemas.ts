import { RouteStatus } from '@/generated/prisma/enums';
import z from 'zod';

export const createRouteSchema = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .min(3, 'Nama minimal 3 karakter'),
  originCity: z
    .string({ error: 'Kota asal wajib diisi' })
    .min(2, 'Kota asal minimal 2 karakter'),
  destinationCity: z
    .string({ error: 'Kota tujuan wajib diisi' })
    .min(2, 'Kota tujuan minimal 2 karakter'),
  originLat: z
    .number({ error: 'Latitude asal wajib diisi' })
    .min(-90, 'Latitude harus antara -90 dan 90')
    .max(90, 'Latitude harus antara -90 dan 90'),
  originLng: z
    .number({ error: 'Longitude asal wajib diisi' })
    .min(-180, 'Longitude harus antara -180 dan 180')
    .max(180, 'Longitude harus antara -180 dan 180'),
  destinationLat: z
    .number({ error: 'Latitude tujuan wajib diisi' })
    .min(-90, 'Latitude harus antara -90 dan 90')
    .max(90, 'Latitude harus antara -90 dan 90'),
  destinationLng: z
    .number({ error: 'Longitude tujuan wajib diisi' })
    .min(-180, 'Longitude harus antara -180 dan 180')
    .max(180, 'Longitude harus antara -180 dan 180'),
  durationMinutes: z
    .number({ error: 'Durasi wajib diisi' })
    .int('Durasi harus bilangan bulat')
    .positive('Durasi harus lebih dari 0'),
  path: z.record(z.string(), z.json()).nullable().optional(),
  status: z.enum(RouteStatus, { error: 'Status tidak valid' }).optional(),
});

export type CreateRoute = z.infer<typeof createRouteSchema>;

export const updateRouteSchema = createRouteSchema.partial();

export type UpdateRoute = z.infer<typeof updateRouteSchema>;

export const routeStatusSchema = z.enum(RouteStatus, {
  error: 'Status tidak valid',
});
