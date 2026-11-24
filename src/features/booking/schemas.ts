import z from 'zod';

export const passengerSchema = z.object({
  seatNumber: z.string().min(1, 'Kursi wajib dipilih'),
  passengerName: z
    .string({ error: 'Nama penumpang wajib diisi' })
    .min(3, 'Nama minimal 3 karakter'),
});

export const bookingServiceSchema = z.object({
  serviceId: z.string().min(1),
  quantity: z
    .number()
    .int('Jumlah harus bilangan bulat')
    .min(1, 'Jumlah minimal 1')
    .max(99, 'Jumlah maksimal 99'),
});

export const createBookingSchema = z.object({
  tripId: z.string().min(1, 'Perjalanan tidak valid'),
  passengers: z.array(passengerSchema).min(1, 'Pilih minimal 1 kursi'),
  services: z.array(bookingServiceSchema).default([]),
});

export type CreateBooking = z.infer<typeof createBookingSchema>;
export type PassengerInput = z.infer<typeof passengerSchema>;
export type BookingServiceInput = z.infer<typeof bookingServiceSchema>;
