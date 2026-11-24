import { readFleet } from '@/features/fleet/services';
import { apiHandler, ApiResponse } from '@/lib/api';
import { authorized } from '@/lib/auth';

export type GetFleetResponse = ApiResponse<
  Awaited<ReturnType<typeof readFleet>>
>;

export const GET = apiHandler(async (_, ctx): Promise<GetFleetResponse> => {
  await authorized(['ADMIN'], 'throw');

  const data = await readFleet(ctx.params.id);
  return { message: 'Success', data };
});
