import { readBooking } from '@/features/booking/services';
import { apiHandler, ApiError, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetBookingResponse = ApiResponse<
  Awaited<ReturnType<typeof readBooking>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetBookingResponse> => {
  const session = await authorized(['PASSENGER'], 'throw');
  const data = await readBooking(session.user.id, ctx.params.code);
  if (!data) throw new ApiError('NOT_FOUND', 'Pemesanan tidak ditemukan', 404);
  return { message: 'Success', data };
});
