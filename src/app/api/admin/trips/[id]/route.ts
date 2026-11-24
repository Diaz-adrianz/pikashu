import { readTrip } from '@/features/trip/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetAdminTripResponse = ApiResponse<
  Awaited<ReturnType<typeof readTrip>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetAdminTripResponse> => {
  await authorized(['ADMIN'], 'throw');
  const data = await readTrip(ctx.params.id);
  return { message: 'Success', data };
});
