import { readPublicTrip } from '@/features/trip/services';
import { apiHandler, ApiResponse } from '@/lib/api';

export type GetTripResponse = ApiResponse<
  Awaited<ReturnType<typeof readPublicTrip>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetTripResponse> => {
  const data = await readPublicTrip(ctx.params.id);
  if (!data) return { status: 404, message: 'Perjalanan tidak ditemukan', data: null };
  return { message: 'Success', data };
});
