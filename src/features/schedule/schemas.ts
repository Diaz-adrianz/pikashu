import z from 'zod';

const time = z
  .string({ error: 'Jam wajib diisi' })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Format jam harus HH:mm');

export const createScheduleSchema = z.object({
  routeId: z.string().min(1, 'Rute wajib dipilih'),
  fleetId: z.string().min(1, 'Armada wajib dipilih'),
  departureTime: time,
});

export type CreateSchedule = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = createScheduleSchema.partial().extend({
  status: z.enum(['ACTIVE', 'INACTIVE'], { error: 'Status tidak valid' }).optional(),
});

export type UpdateSchedule = z.infer<typeof updateScheduleSchema>;
